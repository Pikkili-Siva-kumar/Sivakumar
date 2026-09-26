import logging
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import OperationalError

from app.extensions import db
from app.models.contact_message import ContactMessage
from app.services.auth_service import EMAIL_REGEX
from app.services.email_service import (
    send_admin_contact_notification,
    send_contact_acknowledgement,
)

logger = logging.getLogger(__name__)

contact_messages_bp = Blueprint("contact_messages", __name__)


@contact_messages_bp.route("/contact-messages", methods=["POST"])
@contact_messages_bp.route("/contact", methods=["POST"])
def submit_contact_message():
    """
    Public endpoint: Submit a contact message.
    Validates required fields, persists submission in MySQL, and sets status to 'new'.
    No authentication required.
    """
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    # Required field validations
    if not name:
        return jsonify({"status": "error", "message": "Name is required."}), 400

    if not email:
        return jsonify({"status": "error", "message": "Email address is required."}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({"status": "error", "message": "Please provide a valid email address."}), 400

    if not subject:
        return jsonify({"status": "error", "message": "Subject is required."}), 400

    if not message:
        return jsonify({"status": "error", "message": "Message content is required."}), 400

    try:
        new_message = ContactMessage(
            name=name,
            email=email,
            subject=subject,
            message=message,
            status="new",
        )

        db.session.add(new_message)
        db.session.commit()

        # Attempt email notifications after successful database commit
        message_dict = new_message.to_dict()
        try:
            send_admin_contact_notification(message_dict)
            if email:
                send_contact_acknowledgement(message_dict)
        except Exception as email_err:
            logger.warning(
                "Contact message #%d saved, but email notification failed: %s",
                new_message.id,
                type(email_err).__name__,
            )

        logger.info(
            "New contact message #%d received from '%s' (%s) with subject '%s'",
            new_message.id,
            new_message.name,
            new_message.email,
            new_message.subject,
        )

        return (
            jsonify({
                "status": "ok",
                "message": "Message sent successfully.",
                "message_id": new_message.id,
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error during contact message submission: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please try again later.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Unexpected error submitting contact message: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not submit your message at this time. Please try again later.",
            }),
            500,
        )
