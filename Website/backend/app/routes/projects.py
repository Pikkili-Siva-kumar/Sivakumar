import logging
from flask import Blueprint, jsonify
from sqlalchemy.exc import OperationalError

from app.models.project import Project

logger = logging.getLogger(__name__)

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/projects", methods=["GET"])
def get_public_projects():
    """
    Public endpoint: Retrieve all published projects.
    Draft / unpublished projects are excluded from public results.
    """
    try:
        projects = (
            Project.query.filter_by(status="published")
            .order_by(Project.featured.desc(), Project.id.asc())
            .all()
        )
        return (
            jsonify({
                "status": "ok",
                "count": len(projects),
                "projects": [p.to_dict() for p in projects],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching public projects: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "projects": [],
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving public projects: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve projects at this time.",
                "projects": [],
            }),
            500,
        )


@projects_bp.route("/projects/<string:slug>", methods=["GET"])
def get_public_project_by_slug(slug):
    """
    Public endpoint: Retrieve a published project by its slug.
    Draft / unpublished projects return 404 to protect unpublished work.
    """
    normalized_slug = slug.strip().lower()
    try:
        project = Project.query.filter_by(slug=normalized_slug, status="published").first()
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
        logger.warning("Database error fetching project slug '%s': %s", slug, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving project '%s': %s", slug, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve project at this time.",
            }),
            500,
        )
