import logging
from flask import Blueprint, jsonify
from sqlalchemy.exc import OperationalError

from app.models.service import Service

logger = logging.getLogger(__name__)

services_bp = Blueprint("services", __name__)


@services_bp.route("/services", methods=["GET"])
def get_services():
    """
    Public endpoint: Retrieve all published services.
    Draft services are excluded.
    Sorted by display_order ascending, then created_at ascending.
    """
    try:
        services = (
            Service.query.filter_by(status="published")
            .order_by(Service.display_order.asc(), Service.created_at.asc())
            .all()
        )

        return (
            jsonify({
                "status": "ok",
                "count": len(services),
                "services": [s.to_dict() for s in services],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching services: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
                "services": [],
                "count": 0,
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving services: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve services at this time.",
                "services": [],
                "count": 0,
            }),
            500,
        )


@services_bp.route("/services/<string:slug>", methods=["GET"])
def get_service_by_slug(slug):
    """
    Public endpoint: Retrieve a single published service by unique slug.
    Draft services return 404.
    """
    try:
        service = Service.query.filter_by(
            slug=slug.strip().lower(), status="published"
        ).first()

        if not service:
            return (
                jsonify({
                    "status": "error",
                    "message": "Service not found.",
                }),
                404,
            )

        return (
            jsonify({
                "status": "ok",
                "service": service.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching service %s: %s", slug, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving service %s: %s", slug, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve service details.",
            }),
            500,
        )
