import logging
from flask import Blueprint, g, jsonify
from sqlalchemy.exc import OperationalError

from app.models.project_request import ProjectRequest
from app.services.auth_service import auth_required

logger = logging.getLogger(__name__)

client_bp = Blueprint("client", __name__)


@client_bp.route("/client/project-requests", methods=["GET"])
@auth_required
def get_client_project_requests():
    """
    Client Dashboard endpoint: Retrieve project requests belonging exclusively
    to the current authenticated normal user.
    Admins are directed to the admin workspace.
    Never returns admin_notes, credentials, or other users' data.
    """
    user = g.current_user
    if user.role == "admin":
        return (
            jsonify({
                "status": "error",
                "message": "Admins must use the admin dashboard.",
            }),
            403,
        )

    try:
        user_requests = (
            ProjectRequest.query.filter_by(user_id=user.id)
            .order_by(ProjectRequest.created_at.desc())
            .all()
        )

        return (
            jsonify({
                "status": "ok",
                "count": len(user_requests),
                "requests": [r.to_client_dict() for r in user_requests],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching client requests: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error fetching client project requests: %s", str(e))
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve project requests.",
            }),
            500,
        )


@client_bp.route("/client/project-requests/<int:request_id>", methods=["GET"])
@auth_required
def get_client_project_request_detail(request_id):
    """
    Client Dashboard endpoint: Retrieve details of a specific project request.
    Strictly enforces ownership: user_id == current_user.id.
    Returns 404 safely if not found or owned by another user without leaking existence.
    Never exposes admin_notes.
    """
    user = g.current_user
    if user.role == "admin":
        return (
            jsonify({
                "status": "error",
                "message": "Admins must use the admin dashboard.",
            }),
            403,
        )

    try:
        req = ProjectRequest.query.filter_by(id=request_id).first()
        if not req or req.user_id != user.id:
            return (
                jsonify({
                    "status": "error",
                    "message": "Project request not found.",
                }),
                404,
            )

        return (
            jsonify({
                "status": "ok",
                "request": req.to_client_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching client request detail: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error fetching client request detail: %s", str(e))
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve project request detail.",
            }),
            500,
        )
