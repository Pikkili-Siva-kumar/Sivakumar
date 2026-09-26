import logging
import re
from flask import Blueprint, jsonify, request
from app.services.gemini_service import generate_project_brief

logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__)

MAX_MESSAGE_LENGTH = 4000

DISALLOWED_INPUT_PATTERNS = [
    "password_hash",
    "secret_key",
    "authorization: bearer",
    "private_key",
    "db_password",
    "mysql_password",
]

CREDENTIAL_REGEXES = [
    re.compile(r"AIza[0-9A-Za-z-_]{30,}", re.IGNORECASE),
    re.compile(r"ghp_[0-9A-Za-z]{30,}", re.IGNORECASE),
    re.compile(r"sk-[0-9A-Za-z]{20,}", re.IGNORECASE),
    re.compile(r"AKIA[0-9A-Z]{16}"),
]


def contains_sensitive_tokens(text: str) -> bool:
    """Check if input text appears to contain private system credentials or secrets."""
    lower = text.lower()
    for pattern in DISALLOWED_INPUT_PATTERNS:
        if pattern in lower:
            return True
    for regex in CREDENTIAL_REGEXES:
        if regex.search(text):
            return True
    return False


@ai_bp.route("/ai/project-assistant", methods=["POST"])
def project_assistant():
    """
    POST /api/ai/project-assistant
    Accepts user's natural language project idea and returns a structured AI-generated brief.
    """
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return (
            jsonify({
                "status": "error",
                "message": "Invalid request payload. Expected JSON object.",
            }),
            400,
        )

    raw_message = data.get("message")
    if raw_message is None:
        return (
            jsonify({
                "status": "error",
                "message": "The 'message' field is required.",
            }),
            400,
        )

    if not isinstance(raw_message, str):
        return (
            jsonify({
                "status": "error",
                "message": "The 'message' field must be a string.",
            }),
            400,
        )

    message = raw_message.strip()
    if not message:
        return (
            jsonify({
                "status": "error",
                "message": "Message cannot be empty.",
            }),
            400,
        )

    if len(message) > MAX_MESSAGE_LENGTH:
        return (
            jsonify({
                "status": "error",
                "message": f"Message exceeds the maximum allowed length of {MAX_MESSAGE_LENGTH} characters.",
            }),
            400,
        )

    if contains_sensitive_tokens(message):
        return (
            jsonify({
                "status": "error",
                "message": "Input contains disallowed sensitive or credential tokens.",
            }),
            400,
        )

    # Validate optional context
    context = data.get("context")
    if context is not None and not isinstance(context, dict):
        context = None

    # Call Gemini service
    brief, error_message, status_code = generate_project_brief(message, context=context)

    if error_message:
        return (
            jsonify({
                "status": "error",
                "message": error_message,
            }),
            status_code,
        )

    return (
        jsonify({
            "status": "ok",
            "brief": brief,
        }),
        200,
    )
