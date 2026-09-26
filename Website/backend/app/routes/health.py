import logging
from flask import Blueprint, jsonify
from sqlalchemy import inspect, text
from app.extensions import db

logger = logging.getLogger(__name__)

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Basic health check endpoint to verify Flask backend status."""
    return (
        jsonify({
            "status": "ok",
            "service": "backend",
        }),
        200,
    )


@health_bp.route("/health/database", methods=["GET"])
def database_health_check():
    """
    Database health check endpoint to verify MySQL connectivity.
    Executes a lightweight query (SELECT 1). Returns 200 if connected,
    or 503 with a secure error response without exposing credentials.
    """
    try:
        # Test connection by executing a lightweight query
        with db.engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return (
            jsonify({
                "status": "ok",
                "database": "connected",
            }),
            200,
        )
    except Exception as e:
        # Log error internally without exposing credentials to caller
        logger.warning("Database health check failed: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "database": "disconnected",
            }),
            503,
        )


@health_bp.route("/health/schema", methods=["GET"])
def schema_health_check():
    """
    Schema health check endpoint to verify that expected application tables exist.
    Returns 200 with tables list when all expected tables exist.
    If unavailable or incomplete, returns safe error response without exposing credentials.
    """
    expected_tables = [
        "users",
        "projects",
        "project_requests",
        "contact_messages",
        "services",
        "blog_posts",
        "analytics_events",
        "site_settings",
    ]
    try:
        with db.engine.connect() as connection:
            inspector = inspect(connection)
            existing_tables = set(inspector.get_table_names())

            # Safely create tables if not existing yet (does not drop or overwrite anything)
            if not all(tbl in existing_tables for tbl in expected_tables):
                try:
                    db.create_all()
                    inspector = inspect(connection)
                    existing_tables = set(inspector.get_table_names())
                except Exception as create_err:
                    logger.warning(
                        "Auto table creation inside schema check failed: %s",
                        type(create_err).__name__,
                    )

        if all(tbl in existing_tables for tbl in expected_tables):
            return (
                jsonify({
                    "status": "ok",
                    "tables": sorted(list(existing_tables)),
                }),
                200,
            )
        else:
            logger.warning(
                "Database schema missing expected tables. Found: %s",
                list(existing_tables),
            )
            return (
                jsonify({
                    "status": "error",
                    "schema": "unavailable",
                }),
                503,
            )
    except Exception as e:
        logger.warning("Database schema check failed: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "schema": "unavailable",
            }),
            503,
        )
