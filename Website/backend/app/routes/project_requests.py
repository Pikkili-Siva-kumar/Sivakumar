import logging
import re
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import OperationalError

from app.extensions import db
from app.models.project_request import ProjectRequest
from app.services.auth_service import EMAIL_REGEX, verify_auth_token
from app.services.email_service import (
    send_admin_project_request_notification,
    send_project_request_acknowledgement,
)

logger = logging.getLogger(__name__)

project_requests_bp = Blueprint("project_requests", __name__)


@project_requests_bp.route("/project-requests", methods=["POST"])
def submit_project_request():
    """
    Public endpoint: Submit a project inquiry.
    Validates required fields, persists submission in MySQL, and sets status to 'new'.
    No authentication required.
    """
    data = request.get_json(silent=True) or {}

    project_type = (data.get("project_type") or "").strip()
    project_name = (data.get("project_name") or "").strip()
    requirement = (data.get("requirement") or data.get("problem_requirement") or "").strip()
    name = (data.get("name") or data.get("client_name") or "").strip()
    email = (data.get("email") or data.get("client_email") or "").strip().lower()

    # Required field validations
    if not project_type:
        return jsonify({"status": "error", "message": "Project type is required."}), 400

    if not project_name:
        return jsonify({"status": "error", "message": "Project name is required."}), 400

    if not requirement:
        return jsonify({"status": "error", "message": "Project requirement is required."}), 400

    if not name:
        return jsonify({"status": "error", "message": "Your name is required."}), 400

    if not email:
        return jsonify({"status": "error", "message": "Email address is required."}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({"status": "error", "message": "Please provide a valid email address."}), 400

    # Optional fields
    features = (data.get("features") or "").strip() or None
    technology_preference = (data.get("technology_preference") or "").strip() or None
    timeline = (data.get("timeline") or "").strip() or None
    budget_range = (data.get("budget_range") or "").strip() or None
    additional_requirements = (data.get("additional_requirements") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    preferred_contact = (data.get("preferred_contact") or "").strip() or None
    message = (data.get("message") or "").strip() or None

    # Check for optional authenticated user token
    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        user = verify_auth_token(token)
        if user:
            user_id = user.id

    try:
        new_request = ProjectRequest(
            user_id=user_id,
            project_type=project_type,
            project_name=project_name,
            requirement=requirement,
            features=features,
            technology_preference=technology_preference,
            timeline=timeline,
            budget_range=budget_range,
            additional_requirements=additional_requirements,
            name=name,
            email=email,
            phone=phone,
            preferred_contact=preferred_contact,
            message=message,
            status="new",
        )

        db.session.add(new_request)
        db.session.commit()

        # Attempt email notifications after successful database commit
        request_dict = new_request.to_dict()
        try:
            send_admin_project_request_notification(request_dict)
            if email:
                send_project_request_acknowledgement(request_dict)
        except Exception as email_err:
            logger.warning(
                "Project request #%d saved, but email notification failed: %s",
                new_request.id,
                type(email_err).__name__,
            )

        logger.info(
            "New project request #%d received from '%s' (%s)",
            new_request.id,
            new_request.name,
            new_request.email,
        )

        return (
            jsonify({
                "status": "ok",
                "message": "Project request submitted successfully.",
                "request_id": new_request.id,
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error during project request submission: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please try again later.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error submitting project request: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not submit your project request at this time. Please try again.",
            }),
            500,
        )
