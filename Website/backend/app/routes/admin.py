from datetime import datetime, timezone, timedelta
import logging
import re
from flask import Blueprint, g, jsonify, request
from sqlalchemy import func, distinct
from sqlalchemy.exc import OperationalError
from werkzeug.security import check_password_hash

from app.extensions import db
from app.models.project import Project
from app.models.project_request import ProjectRequest
from app.models.contact_message import ContactMessage
from app.models.service import Service
from app.models.user import User
from app.models.blog_post import BlogPost
from app.models.analytics_event import AnalyticsEvent
from app.models.site_setting import SiteSetting
from app.services.auth_service import admin_required, generate_auth_token

logger = logging.getLogger(__name__)

admin_bp = Blueprint("admin", __name__)

SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VALID_REQUEST_STATUSES = {"new", "contacted", "in_progress", "completed", "cancelled"}
VALID_MESSAGE_STATUSES = {"new", "read", "replied", "archived"}
VALID_SERVICE_STATUSES = {"published", "draft"}
VALID_BLOG_STATUSES = {"published", "draft"}


def is_valid_slug(slug):
    """Validate slug format: lowercase letters, numbers, and hyphens."""
    if not slug or not isinstance(slug, str):
        return False
    return bool(SLUG_REGEX.match(slug.strip().lower()))


@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """
    Authenticate an administrator with email and password.
    Returns an authentication token and safe admin profile upon success.
    Rejects normal users with 403 Forbidden.
    Rejects invalid credentials with 401 to prevent user enumeration.
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password or not isinstance(email, str) or not isinstance(password, str):
        return (
            jsonify({
                "status": "error",
                "message": "Email and password are required.",
            }),
            400,
        )

    normalized_email = email.strip().lower()

    generic_error = (
        jsonify({
            "status": "error",
            "message": "Invalid email or password.",
        }),
        401,
    )

    try:
        user = User.query.filter_by(email=normalized_email).first()
        if not user:
            return generic_error

        if not user.is_active:
            return generic_error

        # Verify password hash
        if not check_password_hash(user.password_hash, password):
            return generic_error

        # Verify role is admin (normal users are forbidden from admin login)
        if user.role != "admin":
            return (
                jsonify({
                    "status": "error",
                    "message": "Access denied. Administrator privileges required.",
                }),
                403,
            )

        # Generate authentication token
        token = generate_auth_token(user.id)

        return (
            jsonify({
                "status": "ok",
                "message": "Admin login successful.",
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                },
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database connection error during admin login: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please check that MySQL is running and DB_PASSWORD is set in backend/.env.",
            }),
            503,
        )


@admin_bp.route("/admin/me", methods=["GET"])
@admin_required
def get_current_admin_profile():
    """
    Return currently authenticated admin's safe profile.
    Requires valid Bearer token belonging to an active user with role == 'admin'.
    Never exposes passwords, hashes, or secrets.
    """
    user = g.current_user
    return (
        jsonify({
            "status": "ok",
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
        }),
        200,
    )


@admin_bp.route("/admin/logout", methods=["POST"])
def admin_logout():
    """
    Stateless admin token logout endpoint.
    Client clears stored authentication token upon receiving successful response.
    """
    return (
        jsonify({
            "status": "ok",
            "message": "Admin logged out successfully.",
        }),
        200,
    )


# =========================================================================
# Admin Account Diagnosis
# =========================================================================


@admin_bp.route("/admin/account-status", methods=["GET"])
def get_admin_account_status():
    """
    Read-only diagnostic endpoint to inspect admin account existence and status.
    Strictly read-only; never exposes passwords, hashes, tokens, or credentials.
    """
    try:
        user = User.query.filter_by(email="admin@example.com").first()
        if not user:
            return jsonify({
                "status": "ok",
                "exists": False,
                "email": "admin@example.com",
                "is_active": False,
                "role": None,
                "has_password_hash": False,
            }), 200

        return jsonify({
            "status": "ok",
            "exists": True,
            "email": user.email,
            "is_active": bool(user.is_active),
            "role": user.role,
            "has_password_hash": bool(user.password_hash and len(user.password_hash) > 0),
        }), 200
    except Exception as e:
        logger.warning("Error checking admin status: %s", type(e).__name__)
        return jsonify({"status": "error", "message": "Database query error"}), 500


# =========================================================================
# Step 18: Admin Projects Management Endpoints
# =========================================================================

@admin_bp.route("/admin/projects", methods=["GET"])
@admin_required
def get_admin_projects():
    """
    Retrieve all projects (both published and draft) for administration.
    Protected: requires role == 'admin'.
    """
    try:
        projects = Project.query.order_by(Project.id.desc()).all()
        return (
            jsonify({
                "status": "ok",
                "count": len(projects),
                "projects": [p.to_dict() for p in projects],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching admin projects: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "projects": [],
                "count": 0,
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving admin projects: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve projects at this time.",
                "projects": [],
                "count": 0,
            }),
            500,
        )


@admin_bp.route("/admin/projects/<int:project_id>", methods=["GET"])
@admin_required
def get_admin_project(project_id):
    """
    Retrieve a single project by ID for editing.
    Protected: requires role == 'admin'.
    """
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return (
                jsonify({
                    "status": "error",
                    "message": "Project not found.",
                }),
                404,
            )

        return (
            jsonify({
                "status": "ok",
                "project": project.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching project %d: %s", project_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )


@admin_bp.route("/admin/projects", methods=["POST"])
@admin_required
def create_admin_project():
    """
    Create a new project.
    Validates required fields, checks slug uniqueness, and stores record in MySQL.
    Protected: requires role == 'admin'.
    """
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    slug = (data.get("slug") or "").strip().lower()
    category = (data.get("category") or "").strip()
    short_description = (data.get("short_description") or "").strip()
    description = (data.get("description") or "").strip()

    # Validation
    if not title:
        return jsonify({"status": "error", "message": "Project title is required."}), 400

    if not slug:
        return jsonify({"status": "error", "message": "Project slug is required."}), 400

    if not is_valid_slug(slug):
        return (
            jsonify({
                "status": "error",
                "message": "Invalid slug format. Use lowercase alphanumeric characters and hyphens (e.g. 'my-new-project').",
            }),
            400,
        )

    if not category:
        return jsonify({"status": "error", "message": "Project category is required."}), 400

    if not short_description:
        return jsonify({"status": "error", "message": "Short description is required."}), 400

    try:
        # Check slug uniqueness
        existing_slug = Project.query.filter_by(slug=slug).first()
        if existing_slug:
            return (
                jsonify({
                    "status": "error",
                    "message": f"A project with the slug '{slug}' already exists.",
                }),
                409,
            )

        # Normalize technologies list
        raw_techs = data.get("technologies", [])
        if isinstance(raw_techs, str):
            techs = [t.strip() for t in raw_techs.split(",") if t.strip()]
        elif isinstance(raw_techs, list):
            techs = [str(t).strip() for t in raw_techs if str(t).strip()]
        else:
            techs = []

        status = (data.get("status") or "published").strip().lower()
        if status not in ["published", "draft"]:
            status = "published"

        featured = bool(data.get("featured", False))
        case_study_route = (data.get("case_study_route") or "").strip() or None
        image_url = (data.get("image_url") or "").strip() or None

        new_project = Project(
            title=title,
            slug=slug,
            category=category,
            short_description=short_description,
            description=description,
            technologies=techs,
            featured=featured,
            status=status,
            case_study_route=case_study_route,
            image_url=image_url,
        )

        db.session.add(new_project)
        db.session.commit()

        logger.info("Admin created project ID %d ('%s')", new_project.id, new_project.slug)

        return (
            jsonify({
                "status": "ok",
                "message": "Project created successfully.",
                "project": new_project.to_dict(),
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error creating project: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error creating project: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not create project. Please try again.",
            }),
            500,
        )


@admin_bp.route("/admin/projects/<int:project_id>", methods=["PUT"])
@admin_required
def update_admin_project(project_id):
    """
    Update an existing project.
    Validates required fields, ensures slug uniqueness against other records, and commits changes.
    Protected: requires role == 'admin'.
    """
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return (
                jsonify({
                    "status": "error",
                    "message": "Project not found.",
                }),
                404,
            )

        data = request.get_json(silent=True) or {}

        # Validate title
        if "title" in data:
            title = (data.get("title") or "").strip()
            if not title:
                return jsonify({"status": "error", "message": "Project title cannot be empty."}), 400
            project.title = title

        # Validate slug
        if "slug" in data:
            slug = (data.get("slug") or "").strip().lower()
            if not slug:
                return jsonify({"status": "error", "message": "Project slug cannot be empty."}), 400
            if not is_valid_slug(slug):
                return (
                    jsonify({
                        "status": "error",
                        "message": "Invalid slug format. Use lowercase alphanumeric characters and hyphens.",
                    }),
                    400,
                )

            # Check if another project already uses this slug
            duplicate = Project.query.filter(Project.slug == slug, Project.id != project_id).first()
            if duplicate:
                return (
                    jsonify({
                        "status": "error",
                        "message": f"A project with the slug '{slug}' already exists.",
                    }),
                    409,
                )
            project.slug = slug

        # Validate category
        if "category" in data:
            category = (data.get("category") or "").strip()
            if not category:
                return jsonify({"status": "error", "message": "Project category cannot be empty."}), 400
            project.category = category

        # Validate short description
        if "short_description" in data:
            short_desc = (data.get("short_description") or "").strip()
            if not short_desc:
                return jsonify({"status": "error", "message": "Short description cannot be empty."}), 400
            project.short_description = short_desc

        if "description" in data:
            project.description = (data.get("description") or "").strip()

        if "technologies" in data:
            raw_techs = data.get("technologies")
            if isinstance(raw_techs, str):
                project.technologies = [t.strip() for t in raw_techs.split(",") if t.strip()]
            elif isinstance(raw_techs, list):
                project.technologies = [str(t).strip() for t in raw_techs if str(t).strip()]

        if "featured" in data:
            project.featured = bool(data.get("featured"))

        if "status" in data:
            status = (data.get("status") or "published").strip().lower()
            if status in ["published", "draft"]:
                project.status = status

        if "case_study_route" in data:
            csr = (data.get("case_study_route") or "").strip()
            project.case_study_route = csr or None

        if "image_url" in data:
            img = (data.get("image_url") or "").strip()
            project.image_url = img or None

        db.session.commit()

        logger.info("Admin updated project ID %d ('%s')", project.id, project.slug)

        return (
            jsonify({
                "status": "ok",
                "message": "Project updated successfully.",
                "project": project.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating project %d: %s", project_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating project %d: %s", project_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not update project.",
            }),
            500,
        )


@admin_bp.route("/admin/projects/<int:project_id>", methods=["DELETE"])
@admin_required
def delete_admin_project(project_id):
    """
    Delete a specific project by ID.
    Protected: requires role == 'admin'.
    """
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return (
                jsonify({
                    "status": "error",
                    "message": "Project not found.",
                }),
                404,
            )

        db.session.delete(project)
        db.session.commit()

        logger.info("Admin deleted project ID %d", project_id)

        return (
            jsonify({
                "status": "ok",
                "message": "Project deleted successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting project %d: %s", project_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting project %d: %s", project_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not delete project.",
            }),
            500,
        )


# =========================================================================
# Step 19: Admin Project Requests Management Endpoints
# =========================================================================

@admin_bp.route("/admin/project-requests", methods=["GET"])
@admin_required
def get_admin_project_requests():
    """
    Retrieve project requests submitted by visitors.
    Supports status filtering and text search across name, email, project_name.
    Protected: requires role == 'admin'.
    """
    status = request.args.get("status", "").strip().lower()
    search = request.args.get("search", "").strip()

    try:
        query = ProjectRequest.query

        if status and status in VALID_REQUEST_STATUSES:
            query = query.filter(ProjectRequest.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (ProjectRequest.name.ilike(search_term))
                | (ProjectRequest.email.ilike(search_term))
                | (ProjectRequest.project_name.ilike(search_term))
            )

        requests_list = query.order_by(ProjectRequest.created_at.desc()).all()
        total_count = ProjectRequest.query.count()

        return (
            jsonify({
                "status": "ok",
                "count": len(requests_list),
                "total_count": total_count,
                "project_requests": [r.to_dict() for r in requests_list],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching project requests: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "project_requests": [],
                "count": 0,
                "total_count": 0,
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving project requests: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve project requests at this time.",
                "project_requests": [],
                "count": 0,
                "total_count": 0,
            }),
            500,
        )


@admin_bp.route("/admin/project-requests/<int:request_id>", methods=["GET"])
@admin_required
def get_admin_project_request(request_id):
    """
    Retrieve a single project request by ID.
    Protected: requires role == 'admin'.
    """
    try:
        req = db.session.get(ProjectRequest, request_id)
        if not req:
            return jsonify({"status": "error", "message": "Project request not found."}), 404

        return jsonify({"status": "ok", "project_request": req.to_dict()}), 200
    except OperationalError as db_err:
        logger.warning("Database error fetching project request %d: %s", request_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )


@admin_bp.route("/admin/project-requests/<int:request_id>", methods=["PUT"])
@admin_required
def update_admin_project_request(request_id):
    """
    Update project request status and/or internal admin notes.
    Protected: requires role == 'admin'.
    """
    try:
        req = db.session.get(ProjectRequest, request_id)
        if not req:
            return jsonify({"status": "error", "message": "Project request not found."}), 404

        data = request.get_json(silent=True) or {}

        if "status" in data:
            new_status = (data.get("status") or "").strip().lower()
            if new_status not in VALID_REQUEST_STATUSES:
                return (
                    jsonify({
                        "status": "error",
                        "message": f"Invalid status. Must be one of: {', '.join(sorted(VALID_REQUEST_STATUSES))}.",
                    }),
                    400,
                )
            req.status = new_status

        if "admin_notes" in data:
            req.admin_notes = (data.get("admin_notes") or "").strip()

        db.session.commit()
        logger.info("Admin updated project request #%d (status='%s')", req.id, req.status)

        return (
            jsonify({
                "status": "ok",
                "message": "Project request updated successfully.",
                "project_request": req.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating project request %d: %s", request_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating project request %d: %s", request_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not update project request.",
            }),
            500,
        )


@admin_bp.route("/admin/project-requests/<int:request_id>", methods=["DELETE"])
@admin_required
def delete_admin_project_request(request_id):
    """
    Delete a specific project request.
    Protected: requires role == 'admin'.
    """
    try:
        req = db.session.get(ProjectRequest, request_id)
        if not req:
            return jsonify({"status": "error", "message": "Project request not found."}), 404

        db.session.delete(req)
        db.session.commit()
        logger.info("Admin deleted project request #%d", request_id)

        return (
            jsonify({
                "status": "ok",
                "message": "Project request deleted successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting project request %d: %s", request_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting project request %d: %s", request_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not delete project request.",
            }),
            500,
        )


# =========================================================================
# Step 20: Admin Contact Messages Management Endpoints
# =========================================================================

@admin_bp.route("/admin/messages", methods=["GET"])
@admin_required
def get_admin_messages():
    """
    Retrieve contact messages submitted by visitors.
    Supports status filtering and search across name, email, subject.
    Newest messages first.
    Protected: requires role == 'admin'.
    """
    status = request.args.get("status", "").strip().lower()
    search = request.args.get("search", "").strip()

    try:
        query = ContactMessage.query

        if status and status in VALID_MESSAGE_STATUSES:
            query = query.filter(ContactMessage.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (ContactMessage.name.ilike(search_term))
                | (ContactMessage.email.ilike(search_term))
                | (ContactMessage.subject.ilike(search_term))
            )

        messages_list = query.order_by(ContactMessage.created_at.desc()).all()
        total_count = ContactMessage.query.count()

        return (
            jsonify({
                "status": "ok",
                "count": len(messages_list),
                "total_count": total_count,
                "messages": [m.to_dict() for m in messages_list],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching contact messages: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "messages": [],
                "count": 0,
                "total_count": 0,
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving contact messages: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve contact messages at this time.",
                "messages": [],
                "count": 0,
                "total_count": 0,
            }),
            500,
        )


@admin_bp.route("/admin/messages/<int:message_id>", methods=["GET"])
@admin_required
def get_admin_message(message_id):
    """
    Retrieve a single contact message by ID.
    Protected: requires role == 'admin'.
    """
    try:
        msg = db.session.get(ContactMessage, message_id)
        if not msg:
            return jsonify({"status": "error", "message": "Message not found."}), 404

        return jsonify({"status": "ok", "message": msg.to_dict()}), 200
    except OperationalError as db_err:
        logger.warning("Database error fetching message %d: %s", message_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )


@admin_bp.route("/admin/messages/<int:message_id>", methods=["PUT"])
@admin_required
def update_admin_message(message_id):
    """
    Update contact message status.
    Do not allow modifying original sender message content.
    Protected: requires role == 'admin'.
    """
    try:
        msg = db.session.get(ContactMessage, message_id)
        if not msg:
            return jsonify({"status": "error", "message": "Message not found."}), 404

        data = request.get_json(silent=True) or {}

        if "status" not in data:
            return jsonify({"status": "error", "message": "Status field is required."}), 400

        new_status = (data.get("status") or "").strip().lower()
        if new_status not in VALID_MESSAGE_STATUSES:
            return (
                jsonify({
                    "status": "error",
                    "message": f"Invalid status. Must be one of: {', '.join(sorted(VALID_MESSAGE_STATUSES))}.",
                }),
                400,
            )

        msg.status = new_status
        db.session.commit()

        logger.info("Admin updated contact message #%d (status='%s')", msg.id, msg.status)

        return (
            jsonify({
                "status": "ok",
                "message": "Message status updated successfully.",
                "contact_message": msg.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating contact message %d: %s", message_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating contact message %d: %s", message_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not update contact message.",
            }),
            500,
        )


@admin_bp.route("/admin/messages/<int:message_id>", methods=["DELETE"])
@admin_required
def delete_admin_message(message_id):
    """
    Permanently delete a contact message.
    Protected: requires role == 'admin'.
    """
    try:
        msg = db.session.get(ContactMessage, message_id)
        if not msg:
            return jsonify({"status": "error", "message": "Message not found."}), 404

        db.session.delete(msg)
        db.session.commit()

        logger.info("Admin deleted contact message #%d", message_id)

        return (
            jsonify({
                "status": "ok",
                "message": "Message deleted successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting message %d: %s", message_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting contact message %d: %s", message_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not delete contact message.",
            }),
            500,
        )


# =========================================================================
# Step 21: Admin Services Management Endpoints
# =========================================================================

@admin_bp.route("/admin/services", methods=["GET"])
@admin_required
def get_admin_services():
    """
    Retrieve all services (both published and drafts) for admin management.
    Supports status filtering and text search across title, slug, short_description.
    Sorted by display_order ascending, then created_at ascending.
    Protected: requires role == 'admin'.
    """
    status = request.args.get("status", "").strip().lower()
    search = request.args.get("search", "").strip()

    try:
        query = Service.query

        if status and status in VALID_SERVICE_STATUSES:
            query = query.filter(Service.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Service.title.ilike(search_term))
                | (Service.slug.ilike(search_term))
                | (Service.short_description.ilike(search_term))
            )

        services_list = query.order_by(Service.display_order.asc(), Service.created_at.asc()).all()
        total_count = Service.query.count()

        return (
            jsonify({
                "status": "ok",
                "count": len(services_list),
                "total_count": total_count,
                "services": [s.to_dict() for s in services_list],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching admin services: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "services": [],
                "count": 0,
                "total_count": 0,
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving admin services: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve services at this time.",
                "services": [],
                "count": 0,
                "total_count": 0,
            }),
            500,
        )


@admin_bp.route("/admin/services/<int:service_id>", methods=["GET"])
@admin_required
def get_admin_service(service_id):
    """
    Retrieve a single service by ID for editing.
    Protected: requires role == 'admin'.
    """
    try:
        service = db.session.get(Service, service_id)
        if not service:
            return jsonify({"status": "error", "message": "Service not found."}), 404

        return jsonify({"status": "ok", "service": service.to_dict()}), 200
    except OperationalError as db_err:
        logger.warning("Database error fetching service %d: %s", service_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )


@admin_bp.route("/admin/services", methods=["POST"])
@admin_required
def create_admin_service():
    """
    Create a new service.
    Validates required fields, checks slug uniqueness, and stores record in MySQL.
    Protected: requires role == 'admin'.
    """
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    slug = (data.get("slug") or "").strip().lower()
    short_description = (data.get("short_description") or "").strip()
    description = (data.get("description") or "").strip() or None

    # Validation
    if not title:
        return jsonify({"status": "error", "message": "Service title is required."}), 400

    if not slug:
        return jsonify({"status": "error", "message": "Service slug is required."}), 400

    if not is_valid_slug(slug):
        return (
            jsonify({
                "status": "error",
                "message": "Invalid slug format. Use lowercase alphanumeric characters and hyphens (e.g. 'web-application-development').",
            }),
            400,
        )

    if not short_description:
        return jsonify({"status": "error", "message": "Short description is required."}), 400

    # Display order validation
    display_order = data.get("display_order", 0)
    try:
        display_order = int(display_order)
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Display order must be a valid number."}), 400

    try:
        # Check slug uniqueness
        existing_slug = Service.query.filter_by(slug=slug).first()
        if existing_slug:
            return (
                jsonify({
                    "status": "error",
                    "message": f"A service with the slug '{slug}' already exists.",
                }),
                409,
            )

        # Normalize technologies list
        raw_techs = data.get("technologies", [])
        if isinstance(raw_techs, str):
            techs = [t.strip() for t in raw_techs.split(",") if t.strip()]
        elif isinstance(raw_techs, list):
            techs = [str(t).strip() for t in raw_techs if str(t).strip()]
        else:
            techs = []

        status = (data.get("status") or "published").strip().lower()
        if status not in VALID_SERVICE_STATUSES:
            status = "published"

        featured = bool(data.get("featured", False))

        new_service = Service(
            title=title,
            slug=slug,
            short_description=short_description,
            description=description or short_description,
            technologies=techs,
            featured=featured,
            status=status,
            display_order=display_order,
        )

        db.session.add(new_service)
        db.session.commit()

        logger.info("Admin created new service ID %d ('%s')", new_service.id, new_service.slug)

        return (
            jsonify({
                "status": "ok",
                "message": "Service created successfully.",
                "service": new_service.to_dict(),
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error creating service: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error creating service: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not create service.",
            }),
            500,
        )


@admin_bp.route("/admin/services/<int:service_id>", methods=["PUT"])
@admin_required
def update_admin_service(service_id):
    """
    Update an existing service by ID.
    Validates updated fields and slug uniqueness.
    Protected: requires role == 'admin'.
    """
    try:
        service = db.session.get(Service, service_id)
        if not service:
            return jsonify({"status": "error", "message": "Service not found."}), 404

        data = request.get_json(silent=True) or {}

        # Validate title
        if "title" in data:
            title = (data.get("title") or "").strip()
            if not title:
                return jsonify({"status": "error", "message": "Service title cannot be empty."}), 400
            service.title = title

        # Validate slug
        if "slug" in data:
            slug = (data.get("slug") or "").strip().lower()
            if not slug:
                return jsonify({"status": "error", "message": "Service slug cannot be empty."}), 400
            if not is_valid_slug(slug):
                return (
                    jsonify({
                        "status": "error",
                        "message": "Invalid slug format. Use lowercase alphanumeric characters and hyphens.",
                    }),
                    400,
                )

            # Check uniqueness against other services
            existing = Service.query.filter(Service.slug == slug, Service.id != service_id).first()
            if existing:
                return (
                    jsonify({
                        "status": "error",
                        "message": f"A service with the slug '{slug}' already exists.",
                    }),
                    409,
                )
            service.slug = slug

        # Validate short description
        if "short_description" in data:
            short_desc = (data.get("short_description") or "").strip()
            if not short_desc:
                return jsonify({"status": "error", "message": "Short description cannot be empty."}), 400
            service.short_description = short_desc

        if "description" in data:
            service.description = (data.get("description") or "").strip()

        if "technologies" in data:
            raw_techs = data.get("technologies")
            if isinstance(raw_techs, str):
                service.technologies = [t.strip() for t in raw_techs.split(",") if t.strip()]
            elif isinstance(raw_techs, list):
                service.technologies = [str(t).strip() for t in raw_techs if str(t).strip()]

        if "featured" in data:
            service.featured = bool(data.get("featured"))

        if "status" in data:
            status = (data.get("status") or "published").strip().lower()
            if status in VALID_SERVICE_STATUSES:
                service.status = status

        if "display_order" in data:
            try:
                service.display_order = int(data.get("display_order", 0))
            except (TypeError, ValueError):
                return jsonify({"status": "error", "message": "Display order must be a valid number."}), 400

        db.session.commit()

        logger.info("Admin updated service ID %d ('%s')", service.id, service.slug)

        return (
            jsonify({
                "status": "ok",
                "message": "Service updated successfully.",
                "service": service.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating service %d: %s", service_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating service %d: %s", service_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not update service.",
            }),
            500,
        )


@admin_bp.route("/admin/services/<int:service_id>", methods=["DELETE"])
@admin_required
def delete_admin_service(service_id):
    """
    Permanently delete a service.
    Protected: requires role == 'admin'.
    """
    try:
        service = db.session.get(Service, service_id)
        if not service:
            return jsonify({"status": "error", "message": "Service not found."}), 404

        db.session.delete(service)
        db.session.commit()

        logger.info("Admin deleted service ID %d", service_id)

        return (
            jsonify({
                "status": "ok",
                "message": "Service deleted successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting service %d: %s", service_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting service %d: %s", service_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not delete service.",
            }),
            500,
        )


# ============================================================================
# Admin Users Management Endpoints (Step 22)
# ============================================================================


@admin_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_admin_users():
    """
    List registered users with optional search, role, and active status filters.
    Protected: requires role == 'admin'.
    Never returns passwords, password hashes, or secrets.
    """
    try:
        query = User.query

        # Search filter by name or email
        search_term = request.args.get("search", "").strip()
        if search_term:
            like_pat = f"%{search_term}%"
            query = query.filter(
                db.or_(
                    User.name.ilike(like_pat),
                    User.email.ilike(like_pat),
                )
            )

        # Role filter
        role_filter = request.args.get("role", "").strip().lower()
        if role_filter in {"admin", "user"}:
            query = query.filter(User.role == role_filter)

        # Status filter (active / inactive)
        status_filter = request.args.get("status", "").strip().lower()
        if status_filter in {"active", "true", "1"}:
            query = query.filter(User.is_active.is_(True))
        elif status_filter in {"inactive", "false", "0"}:
            query = query.filter(User.is_active.is_(False))

        # Order by created_at desc (newest first)
        users = query.order_by(User.created_at.desc()).all()
        total_count = User.query.count()

        return (
            jsonify({
                "status": "ok",
                "count": len(users),
                "total_count": total_count,
                "users": [user.to_dict() for user in users],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching users: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error fetching users: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve users.",
            }),
            500,
        )


@admin_bp.route("/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_admin_user_detail(user_id):
    """
    Retrieve single user details.
    Protected: requires role == 'admin'.
    Never returns passwords or secrets.
    """
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        return (
            jsonify({
                "status": "ok",
                "user": user.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching user %d: %s", user_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error fetching user %d: %s", user_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve user details.",
            }),
            500,
        )


@admin_bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_admin_user(user_id):
    """
    Update a user's account status (activate/deactivate).
    Protected: requires role == 'admin'.
    Security rules:
      - Admin cannot deactivate self.
      - Final active admin cannot be deactivated.
      - Role modification is restricted.
      - Passwords and password hashes remain untouched.
    """
    current_admin = g.current_user
    data = request.get_json(silent=True) or {}

    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        # Disallow arbitrary role escalation / changes
        if "role" in data and data["role"] != user.role:
            return (
                jsonify({
                    "status": "error",
                    "message": "Role modification is restricted.",
                }),
                400,
            )

        # Handle activation/deactivation
        if "is_active" in data:
            new_is_active = bool(data["is_active"])
            if user.is_active and not new_is_active:
                # Attempting to deactivate
                if user.id == current_admin.id:
                    return (
                        jsonify({
                            "status": "error",
                            "message": "You cannot deactivate your own admin account.",
                        }),
                        400,
                    )

                if user.role == "admin":
                    active_admins = User.query.filter_by(role="admin", is_active=True).count()
                    if active_admins <= 1:
                        return (
                            jsonify({
                                "status": "error",
                                "message": "Cannot deactivate the final active administrator account.",
                            }),
                            400,
                        )

            user.is_active = new_is_active

        db.session.commit()

        logger.info(
            "Admin user %d updated user %d (is_active=%s)",
            current_admin.id,
            user.id,
            user.is_active,
        )

        return (
            jsonify({
                "status": "ok",
                "message": "User status updated successfully.",
                "user": user.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating user %d: %s", user_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating user %d: %s", user_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not update user.",
            }),
            500,
        )


@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_admin_user(user_id):
    """
    Permanently delete a user account.
    Protected: requires role == 'admin'.
    Security rules:
      - Admin cannot delete self.
      - Final active admin cannot be deleted.
    """
    current_admin = g.current_user

    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        # Rule: Admin cannot delete self
        if user.id == current_admin.id:
            return (
                jsonify({
                    "status": "error",
                    "message": "You cannot delete your own admin account.",
                }),
                400,
            )

        # Rule: Cannot delete final active admin
        if user.role == "admin" and user.is_active:
            active_admins = User.query.filter_by(role="admin", is_active=True).count()
            if active_admins <= 1:
                return (
                    jsonify({
                        "status": "error",
                        "message": "Cannot delete the final active administrator account.",
                    }),
                    400,
                )

        db.session.delete(user)
        db.session.commit()

        logger.info("Admin user %d deleted user %d (%s)", current_admin.id, user_id, user.email)

        return (
            jsonify({
                "status": "ok",
                "message": "User deleted successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting user %d: %s", user_id, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting user %d: %s", user_id, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not delete user.",
            }),
            500,
        )


# ============================================================================
# Admin Blog Management Endpoints (Step 23)
# ============================================================================


@admin_bp.route("/admin/blog", methods=["GET"])
@admin_required
def get_admin_blog_posts():
    """
    List all blog posts for administrators (drafts and published).
    Supports search by title, excerpt, content; category filter; status filter.
    Protected: requires role == 'admin'.
    """
    try:
        query = BlogPost.query

        search_term = request.args.get("search", "").strip()
        if search_term:
            like_pat = f"%{search_term}%"
            query = query.filter(
                db.or_(
                    BlogPost.title.ilike(like_pat),
                    BlogPost.slug.ilike(like_pat),
                    BlogPost.excerpt.ilike(like_pat),
                    BlogPost.content.ilike(like_pat),
                )
            )

        category = request.args.get("category", "").strip()
        if category:
            query = query.filter(BlogPost.category.ilike(category))

        status = request.args.get("status", "").strip().lower()
        if status in VALID_BLOG_STATUSES:
            query = query.filter_by(status=status)

        posts = query.order_by(BlogPost.created_at.desc()).all()
        total_count = BlogPost.query.count()

        return (
            jsonify({
                "status": "ok",
                "count": len(posts),
                "total_count": total_count,
                "posts": [p.to_dict() for p in posts],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching admin blog posts: %s", type(db_err).__name__)
        return jsonify({"status": "error", "message": "Database connection is currently unavailable."}), 503
    except Exception as e:
        logger.error("Error retrieving admin blog posts: %s", type(e).__name__)
        return jsonify({"status": "error", "message": "Could not retrieve blog posts."}), 500


@admin_bp.route("/admin/blog/<int:post_id>", methods=["GET"])
@admin_required
def get_admin_blog_post(post_id):
    """
    Retrieve full blog post details for editing.
    Protected: requires role == 'admin'.
    """
    try:
        post = db.session.get(BlogPost, post_id)
        if not post:
            return jsonify({"status": "error", "message": "Blog post not found."}), 404

        return jsonify({"status": "ok", "post": post.to_dict()}), 200
    except OperationalError as db_err:
        logger.warning("Database error fetching blog post %d: %s", post_id, type(db_err).__name__)
        return jsonify({"status": "error", "message": "Database connection is currently unavailable."}), 503
    except Exception as e:
        logger.error("Error retrieving blog post %d: %s", post_id, type(e).__name__)
        return jsonify({"status": "error", "message": "Could not retrieve blog post."}), 500


@admin_bp.route("/admin/blog", methods=["POST"])
@admin_required
def create_admin_blog_post():
    """
    Create a new blog post.
    Protected: requires role == 'admin'.
    Required fields: title, slug, content.
    Unique slug validation.
    """
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    slug = (data.get("slug") or "").strip().lower()
    content = (data.get("content") or "").strip()

    if not title:
        return jsonify({"status": "error", "message": "Post title is required."}), 400

    if not slug:
        return jsonify({"status": "error", "message": "Post slug is required."}), 400

    if not is_valid_slug(slug):
        return jsonify({"status": "error", "message": "Invalid slug format. Use only lowercase letters, numbers, and hyphens."}), 400

    if not content:
        return jsonify({"status": "error", "message": "Post content is required."}), 400

    try:
        # Check slug uniqueness
        existing_post = BlogPost.query.filter_by(slug=slug).first()
        if existing_post:
            return jsonify({"status": "error", "message": f"A blog post with slug '{slug}' already exists."}), 409

        status = (data.get("status") or "draft").strip().lower()
        if status not in VALID_BLOG_STATUSES:
            status = "draft"

        featured = bool(data.get("featured", False))
        excerpt = (data.get("excerpt") or "").strip() or None
        category = (data.get("category") or "").strip() or None
        cover_image_url = (data.get("cover_image_url") or "").strip() or None

        # Tags parsing
        raw_tags = data.get("tags")
        cleaned_tags = []
        if isinstance(raw_tags, list):
            cleaned_tags = [str(t).strip() for t in raw_tags if str(t).strip()]
        elif isinstance(raw_tags, str):
            cleaned_tags = [t.strip() for t in raw_tags.split(",") if t.strip()]

        published_at = datetime.now(timezone.utc) if status == "published" else None

        new_post = BlogPost(
            title=title,
            slug=slug,
            excerpt=excerpt,
            content=content,
            category=category,
            tags=cleaned_tags,
            cover_image_url=cover_image_url,
            status=status,
            featured=featured,
            published_at=published_at,
        )

        db.session.add(new_post)
        db.session.commit()

        logger.info("Admin created blog post ID %d ('%s')", new_post.id, new_post.slug)

        return jsonify({
            "status": "ok",
            "message": "Blog post created successfully.",
            "post": new_post.to_dict(),
        }), 201
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error creating blog post: %s", type(db_err).__name__)
        return jsonify({"status": "error", "message": "Database connection is currently unavailable."}), 503
    except Exception as e:
        db.session.rollback()
        logger.error("Error creating blog post: %s", type(e).__name__)
        return jsonify({"status": "error", "message": "Could not create blog post."}), 500


@admin_bp.route("/admin/blog/<int:post_id>", methods=["PUT"])
@admin_required
def update_admin_blog_post(post_id):
    """
    Update an existing blog post.
    Protected: requires role == 'admin'.
    Handles status changes:
      - draft -> published: sets published_at if empty
      - published -> draft: keeps historical timestamps intact
    """
    data = request.get_json(silent=True) or {}

    try:
        post = db.session.get(BlogPost, post_id)
        if not post:
            return jsonify({"status": "error", "message": "Blog post not found."}), 404

        # Slug validation & update if provided
        if "slug" in data:
            new_slug = (data.get("slug") or "").strip().lower()
            if not new_slug:
                return jsonify({"status": "error", "message": "Post slug cannot be empty."}), 400
            if not is_valid_slug(new_slug):
                return jsonify({"status": "error", "message": "Invalid slug format. Use only lowercase letters, numbers, and hyphens."}), 400

            if new_slug != post.slug:
                duplicate = BlogPost.query.filter(BlogPost.slug == new_slug, BlogPost.id != post.id).first()
                if duplicate:
                    return jsonify({"status": "error", "message": f"A blog post with slug '{new_slug}' already exists."}), 409
                post.slug = new_slug

        if "title" in data:
            title = (data.get("title") or "").strip()
            if not title:
                return jsonify({"status": "error", "message": "Post title cannot be empty."}), 400
            post.title = title

        if "content" in data:
            content = (data.get("content") or "").strip()
            if not content:
                return jsonify({"status": "error", "message": "Post content cannot be empty."}), 400
            post.content = content

        if "excerpt" in data:
            post.excerpt = (data.get("excerpt") or "").strip() or None

        if "category" in data:
            post.category = (data.get("category") or "").strip() or None

        if "cover_image_url" in data:
            post.cover_image_url = (data.get("cover_image_url") or "").strip() or None

        if "featured" in data:
            post.featured = bool(data.get("featured"))

        if "tags" in data:
            raw_tags = data.get("tags")
            if isinstance(raw_tags, list):
                post.tags = [str(t).strip() for t in raw_tags if str(t).strip()]
            elif isinstance(raw_tags, str):
                post.tags = [t.strip() for t in raw_tags.split(",") if t.strip()]

        if "status" in data:
            new_status = (data.get("status") or "").strip().lower()
            if new_status in VALID_BLOG_STATUSES:
                if new_status == "published" and post.status != "published":
                    if not post.published_at:
                        post.published_at = datetime.now(timezone.utc)
                post.status = new_status

        db.session.commit()

        logger.info("Admin updated blog post ID %d ('%s')", post.id, post.slug)

        return jsonify({
            "status": "ok",
            "message": "Blog post updated successfully.",
            "post": post.to_dict(),
        }), 200
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating blog post %d: %s", post_id, type(db_err).__name__)
        return jsonify({"status": "error", "message": "Database connection is currently unavailable."}), 503
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating blog post %d: %s", post_id, type(e).__name__)
        return jsonify({"status": "error", "message": "Could not update blog post."}), 500


@admin_bp.route("/admin/blog/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_admin_blog_post(post_id):
    """
    Permanently delete a blog post.
    Protected: requires role == 'admin'.
    """
    try:
        post = db.session.get(BlogPost, post_id)
        if not post:
            return jsonify({"status": "error", "message": "Blog post not found."}), 404

        db.session.delete(post)
        db.session.commit()

        logger.info("Admin deleted blog post ID %d ('%s')", post_id, post.slug)

        return jsonify({
            "status": "ok",
            "message": "Blog post deleted successfully.",
        }), 200
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error deleting blog post %d: %s", post_id, type(db_err).__name__)
        return jsonify({"status": "error", "message": "Database connection is currently unavailable."}), 503
    except Exception as e:
        db.session.rollback()
        logger.error("Error deleting blog post %d: %s", post_id, type(e).__name__)
        return jsonify({"status": "error", "message": "Could not delete blog post."}), 500


# ============================================================================
# Admin Analytics Overview Endpoints (Step 24)
# ============================================================================


@admin_bp.route("/admin/analytics/overview", methods=["GET"])
@admin_required
def get_admin_analytics_overview():
    """
    Return real, first-party aggregated analytics data for the admin dashboard.
    Supports range filter: 'today', '7d', '30d'.
    Returns aggregated metrics, daily time-series buckets, and top content lists.
    No fabricated data.
    """
    range_param = request.args.get("range", "7d").strip().lower()
    if range_param not in {"today", "7d", "30d"}:
        range_param = "7d"

    now = datetime.now(timezone.utc)

    if range_param == "today":
        start_date = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        num_days = 1
    elif range_param == "30d":
        start_date = now - timedelta(days=30)
        num_days = 30
    else:  # '7d'
        start_date = now - timedelta(days=7)
        num_days = 7

    try:
        # Base query filtered by time range
        range_query = AnalyticsEvent.query.filter(AnalyticsEvent.created_at >= start_date)

        # 1. Aggregated metrics for selected range
        total_page_views = range_query.filter_by(event_type="page_view").count()
        unique_sessions = (
            db.session.query(func.count(distinct(AnalyticsEvent.session_id)))
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.session_id.isnot(None),
            )
            .scalar()
            or 0
        )
        project_views = range_query.filter_by(event_type="project_view").count()
        blog_views = range_query.filter_by(event_type="blog_view").count()
        project_requests = range_query.filter_by(event_type="project_request_submitted").count()
        contact_messages = range_query.filter_by(event_type="contact_message_submitted").count()

        # 2. Time-series data for page views and project views over the range
        daily_stats = {}
        if range_param == "today":
            day_str = now.strftime("%Y-%m-%d")
            daily_stats[day_str] = {"date": day_str, "page_views": 0, "project_views": 0}
        else:
            for i in range(num_days, -1, -1):
                day_dt = now - timedelta(days=i)
                day_str = day_dt.strftime("%Y-%m-%d")
                daily_stats[day_str] = {"date": day_str, "page_views": 0, "project_views": 0}

        pv_rows = (
            db.session.query(
                func.date(AnalyticsEvent.created_at).label("day"),
                func.count(AnalyticsEvent.id).label("count"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.event_type == "page_view",
            )
            .group_by("day")
            .all()
        )
        for row in pv_rows:
            day_key = str(row.day)
            if day_key in daily_stats:
                daily_stats[day_key]["page_views"] = row.count

        proj_rows = (
            db.session.query(
                func.date(AnalyticsEvent.created_at).label("day"),
                func.count(AnalyticsEvent.id).label("count"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.event_type == "project_view",
            )
            .group_by("day")
            .all()
        )
        for row in proj_rows:
            day_key = str(row.day)
            if day_key in daily_stats:
                daily_stats[day_key]["project_views"] = row.count

        time_series = sorted(daily_stats.values(), key=lambda d: d["date"])

        # 3. Top Content
        top_projects_rows = (
            db.session.query(
                AnalyticsEvent.path,
                func.count(AnalyticsEvent.id).label("views"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.event_type == "project_view",
                AnalyticsEvent.path.isnot(None),
            )
            .group_by(AnalyticsEvent.path)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(5)
            .all()
        )
        top_projects = [{"path": row.path, "views": row.views} for row in top_projects_rows]

        top_articles_rows = (
            db.session.query(
                AnalyticsEvent.path,
                func.count(AnalyticsEvent.id).label("views"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.event_type == "blog_view",
                AnalyticsEvent.path.isnot(None),
            )
            .group_by(AnalyticsEvent.path)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(5)
            .all()
        )
        top_articles = [{"path": row.path, "views": row.views} for row in top_articles_rows]

        top_pages_rows = (
            db.session.query(
                AnalyticsEvent.path,
                func.count(AnalyticsEvent.id).label("views"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.event_type == "page_view",
                AnalyticsEvent.path.isnot(None),
            )
            .group_by(AnalyticsEvent.path)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(5)
            .all()
        )
        top_pages = [{"path": row.path, "views": row.views} for row in top_pages_rows]

        total_lifetime_events = AnalyticsEvent.query.count()

        return (
            jsonify({
                "status": "ok",
                "range": range_param,
                "metrics": {
                    "page_views": total_page_views,
                    "unique_sessions": unique_sessions,
                    "project_views": project_views,
                    "blog_views": blog_views,
                    "project_requests": project_requests,
                    "messages": contact_messages,
                },
                "time_series": time_series,
                "top_projects": top_projects,
                "top_articles": top_articles,
                "top_pages": top_pages,
                "total_events": total_lifetime_events,
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching analytics overview: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error computing analytics overview: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve analytics overview.",
            }),
            500,
        )


# ==============================================================================
# SETTINGS MANAGEMENT MODULE (Step 25)
# ==============================================================================

SETTINGS_EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
SETTINGS_URL_REGEX = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)

ALLOWED_SETTINGS_METADATA = {
    "site_name": {"type": "string", "max_len": 100, "required": True, "public": True},
    "site_description": {"type": "string", "max_len": 500, "required": False, "public": True},
    "contact_email": {"type": "email", "max_len": 255, "required": True, "public": True},
    "contact_phone": {"type": "string", "max_len": 50, "required": False, "public": True},
    "linkedin_url": {"type": "url", "max_len": 255, "required": False, "public": True},
    "github_url": {"type": "url", "max_len": 255, "required": False, "public": True},
    "seo_title": {"type": "string", "max_len": 150, "required": False, "public": True},
    "seo_description": {"type": "string", "max_len": 300, "required": False, "public": True},
    "maintenance_mode": {"type": "boolean", "required": False, "public": True},
}


def serialize_all_settings():
    """Helper to build settings dictionary with parsed boolean maintenance mode."""
    records = SiteSetting.query.all()
    settings_dict = {}
    for rec in records:
        if rec.key == "maintenance_mode":
            settings_dict[rec.key] = (rec.value or "").strip().lower() in ("true", "1")
        else:
            settings_dict[rec.key] = rec.value or ""

    # Ensure all whitelisted keys exist with defaults
    for k, meta in ALLOWED_SETTINGS_METADATA.items():
        if k not in settings_dict:
            if meta["type"] == "boolean":
                settings_dict[k] = False
            else:
                settings_dict[k] = ""

    return settings_dict, [r.to_dict() for r in records]


@admin_bp.route("/admin/settings", methods=["GET"])
@admin_required
def get_admin_settings():
    """
    Retrieve all site settings for administrative inspection.
    Protected: requires role == 'admin'.
    """
    try:
        settings_dict, raw_list = serialize_all_settings()
        return jsonify({
            "status": "ok",
            "settings": settings_dict,
            "raw": raw_list,
        }), 200
    except OperationalError as db_err:
        logger.warning("Database error fetching admin settings: %s", type(db_err).__name__)
        return jsonify({
            "status": "error",
            "message": "Database connection is currently unavailable.",
        }), 503
    except Exception as e:
        logger.error("Error retrieving admin settings: %s", type(e).__name__)
        return jsonify({
            "status": "error",
            "message": "Could not retrieve settings.",
        }), 500


@admin_bp.route("/admin/settings", methods=["PUT"])
@admin_required
def update_admin_settings():
    """
    Update whitelisted site configuration settings.
    Protected: requires role == 'admin'.
    Rejects unknown keys, invalid URLs, and malformed emails.
    """
    data = request.get_json(silent=True) or {}
    updates = data.get("settings", data) if isinstance(data, dict) else {}

    if not isinstance(updates, dict) or not updates:
        return jsonify({
            "status": "error",
            "message": "No settings provided for update.",
        }), 400

    # 1. Whitelist validation: reject arbitrary or forbidden keys
    for key in updates.keys():
        if key not in ALLOWED_SETTINGS_METADATA:
            return jsonify({
                "status": "error",
                "message": f"Unsupported setting key: '{key}'.",
            }), 400

    # 2. Field content validation
    errors = {}
    cleaned_updates = {}

    for key, val in updates.items():
        meta = ALLOWED_SETTINGS_METADATA[key]
        field_type = meta["type"]

        if field_type == "boolean":
            if isinstance(val, bool):
                cleaned_updates[key] = "true" if val else "false"
            elif isinstance(val, str) and val.lower() in ("true", "false", "1", "0"):
                cleaned_updates[key] = "true" if val.lower() in ("true", "1") else "false"
            else:
                errors[key] = "Maintenance mode must be a boolean (true or false)."

        elif field_type == "string":
            str_val = str(val).strip() if val is not None else ""
            if meta.get("required") and not str_val:
                errors[key] = f"{key.replace('_', ' ').title()} is required."
            elif len(str_val) > meta.get("max_len", 255):
                errors[key] = f"Must not exceed {meta['max_len']} characters."
            else:
                cleaned_updates[key] = str_val

        elif field_type == "email":
            str_val = str(val).strip() if val is not None else ""
            if meta.get("required") and not str_val:
                errors[key] = "Contact email is required."
            elif not SETTINGS_EMAIL_REGEX.match(str_val):
                errors[key] = "Please provide a valid email address (e.g. name@example.com)."
            elif len(str_val) > meta.get("max_len", 255):
                errors[key] = f"Must not exceed {meta['max_len']} characters."
            else:
                cleaned_updates[key] = str_val

        elif field_type == "url":
            str_val = str(val).strip() if val is not None else ""
            if str_val:
                if not (str_val.startswith("http://") or str_val.startswith("https://")):
                    errors[key] = "URL must start with http:// or https://"
                elif len(str_val) > meta.get("max_len", 255):
                    errors[key] = f"Must not exceed {meta['max_len']} characters."
                else:
                    cleaned_updates[key] = str_val
            else:
                cleaned_updates[key] = ""

    if errors:
        return jsonify({
            "status": "error",
            "message": "Validation failed for one or more settings.",
            "errors": errors,
        }), 400

    try:
        for key, str_value in cleaned_updates.items():
            record = SiteSetting.query.filter_by(key=key).first()
            if record:
                record.value = str_value
                record.updated_at = datetime.utcnow()
            else:
                new_record = SiteSetting(
                    key=key,
                    value=str_value,
                    is_public=ALLOWED_SETTINGS_METADATA[key].get("public", True),
                )
                db.session.add(new_record)

        db.session.commit()
        settings_dict, _ = serialize_all_settings()

        return jsonify({
            "status": "ok",
            "message": "Settings updated successfully.",
            "settings": settings_dict,
        }), 200

    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error updating admin settings: %s", type(db_err).__name__)
        return jsonify({
            "status": "error",
            "message": "Database connection is currently unavailable.",
        }), 503
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating settings: %s", type(e).__name__)
        return jsonify({
            "status": "error",
            "message": "Could not save settings.",
        }), 500




