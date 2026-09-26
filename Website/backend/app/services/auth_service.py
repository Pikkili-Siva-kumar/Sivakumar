import logging
import re
from functools import wraps
from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.user import User

logger = logging.getLogger(__name__)

# Default token lifetime: 7 days (in seconds)
DEFAULT_TOKEN_MAX_AGE = 7 * 24 * 60 * 60
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def get_serializer():
    """Retrieve serializer instance configured with application SECRET_KEY."""
    secret_key = current_app.config.get("SECRET_KEY", "dev-secret-key-change-in-production")
    return URLSafeTimedSerializer(secret_key, salt="auth-token")


def generate_auth_token(user_id):
    """
    Generate a cryptographically signed, tamper-proof, timed token for a given user ID.
    Never stores passwords or sensitive data in the token.
    """
    serializer = get_serializer()
    return serializer.dumps({"user_id": user_id})


def verify_auth_token(token, max_age=None):
    """
    Verify and decode an authentication token.
    Returns the associated User instance if valid and active, otherwise None.
    """
    if not token:
        return None

    if max_age is None:
        max_age = current_app.config.get("AUTH_TOKEN_MAX_AGE", DEFAULT_TOKEN_MAX_AGE)

    serializer = get_serializer()
    try:
        data = serializer.loads(token, max_age=max_age)
        user_id = data.get("user_id")
        if not user_id:
            return None

        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            return None

        return user
    except (BadSignature, SignatureExpired):
        return None
    except Exception as e:
        logger.warning("Token verification unexpected error: %s", type(e).__name__)
        return None


def auth_required(f):
    """
    Reusable route decorator requiring a valid Bearer authentication token.
    Attaches the authenticated user to Flask's `g.current_user`.
    Returns 401 JSON error on missing, invalid, or expired tokens.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None

        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

        if not token:
            return (
                jsonify({
                    "status": "error",
                    "message": "Authentication token is missing.",
                }),
                401,
            )

        user = verify_auth_token(token)
        if not user:
            return (
                jsonify({
                    "status": "error",
                    "message": "Invalid or expired authentication token.",
                }),
                401,
            )

        # Make authenticated user available to request context
        g.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def admin_required(f):
    """
    Route decorator requiring a valid Bearer authentication token
    belonging to an active user with role == 'admin'.
    Returns 401 if token is missing, invalid, or expired.
    Returns 403 Forbidden if user is authenticated but not an administrator.
    Attaches the authenticated admin user to Flask's `g.current_user`.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None

        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

        if not token:
            return (
                jsonify({
                    "status": "error",
                    "message": "Authentication token is missing.",
                }),
                401,
            )

        user = verify_auth_token(token)
        if not user:
            return (
                jsonify({
                    "status": "error",
                    "message": "Invalid or expired authentication token.",
                }),
                401,
            )

        if user.role != "admin":
            return (
                jsonify({
                    "status": "error",
                    "message": "Access denied. Administrator privileges required.",
                }),
                403,
            )

        g.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def validate_registration_input(name, email, password):
    """
    Validate user registration fields.
    Returns (is_valid: bool, error_message: str | None).
    """
    if not name or not isinstance(name, str) or not name.strip():
        return False, "Name is required."

    if len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long."

    if not email or not isinstance(email, str) or not email.strip():
        return False, "Email address is required."

    normalized_email = email.strip().lower()
    if not EMAIL_REGEX.match(normalized_email):
        return False, "Please enter a valid email address."

    if not password or not isinstance(password, str):
        return False, "Password is required."

    if len(password) < 8:
        return False, "Password must be at least 8 characters long."

    return True, None
