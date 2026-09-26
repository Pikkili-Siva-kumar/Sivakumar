import json
import logging
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import OperationalError
from app.extensions import db
from app.models.analytics_event import AnalyticsEvent

logger = logging.getLogger(__name__)

analytics_bp = Blueprint("analytics", __name__)

ALLOWED_EVENT_TYPES = {
    "page_view",
    "project_view",
    "blog_view",
    "project_request_submitted",
    "contact_message_submitted",
}

DISALLOWED_KEYS = {
    "password",
    "password_hash",
    "token",
    "auth_token",
    "secret",
    "secret_key",
    "credentials",
    "authorization",
    "phone",
    "email",
    "message",
    "additional_requirements",
}


def sanitize_metadata(meta):
    """
    Ensure metadata is a safe dictionary and does not contain sensitive personal info or credentials.
    """
    if not meta or not isinstance(meta, dict):
        return {}

    sanitized = {}
    for key, val in meta.items():
        clean_key = str(key).strip().lower()
        if clean_key in DISALLOWED_KEYS:
            continue
        # Truncate strings to prevent abuse
        if isinstance(val, str):
            sanitized[str(key)[:50]] = val[:200]
        elif isinstance(val, (int, float, bool)):
            sanitized[str(key)[:50]] = val
        elif isinstance(val, list):
            sanitized[str(key)[:50]] = [str(item)[:100] for item in val[:10]]

    # Limit total serialized metadata size
    try:
        if len(json.dumps(sanitized)) > 4096:
            return {}
    except Exception:
        return {}

    return sanitized


@analytics_bp.route("/analytics/events", methods=["POST"])
def record_event():
    """
    Public ingestion endpoint for first-party analytics events.
    Validates safe event types, limits payload sizes, and prevents admin tracking.
    """
    data = request.get_json(silent=True) or {}

    event_type = (data.get("event_type") or data.get("eventType") or "").strip()
    if not event_type or event_type not in ALLOWED_EVENT_TYPES:
        return (
            jsonify({
                "status": "error",
                "message": f"Invalid or unsupported event_type. Allowed types: {sorted(list(ALLOWED_EVENT_TYPES))}",
            }),
            400,
        )

    raw_path = (data.get("path") or "").strip()
    # Security rule: Never record events from admin paths
    if raw_path.startswith("/admin") or raw_path.startswith("/api/admin"):
        return jsonify({"status": "ok", "message": "Admin paths are excluded from public analytics."}), 200

    path = raw_path[:500] if raw_path else None
    referrer = (data.get("referrer") or request.referrer or "").strip()[:1000] or None
    session_id = (data.get("session_id") or data.get("sessionId") or "").strip()[:128] or None

    metadata = sanitize_metadata(data.get("metadata"))

    try:
        event = AnalyticsEvent(
            event_type=event_type,
            path=path,
            referrer=referrer,
            session_id=session_id,
            event_metadata=metadata,
        )
        db.session.add(event)
        db.session.commit()

        return (
            jsonify({
                "status": "ok",
                "message": "Event recorded.",
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database connection error storing analytics event: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error storing analytics event: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not record analytics event.",
            }),
            500,
        )
