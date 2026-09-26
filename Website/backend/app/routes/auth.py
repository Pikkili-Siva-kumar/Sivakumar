import hashlib
import logging
import secrets
import time
from datetime import datetime, timezone, timedelta
from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import OperationalError
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.user import User
from app.services.auth_service import (
    EMAIL_REGEX,
    auth_required,
    generate_auth_token,
    validate_registration_input,
)
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

# Sliding window rate limiter for password reset requests (5 requests / 15 minutes)
_RATE_LIMIT_WINDOW = 15 * 60
_RATE_LIMIT_MAX_REQUESTS = 5
_reset_rate_limits = {}


def _check_rate_limit(key: str) -> bool:
    """Return True if under rate limit, False if limit exceeded."""
    now = time.time()
    timestamps = _reset_rate_limits.get(key, [])
    timestamps = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW]
    if len(timestamps) >= _RATE_LIMIT_MAX_REQUESTS:
        _reset_rate_limits[key] = timestamps
        return False
    timestamps.append(now)
    _reset_rate_limits[key] = timestamps
    return True


def _is_token_expired(expires_at: datetime) -> bool:
    """Safe comparison between naive or timezone-aware expiry datetime and current UTC time."""
    if not expires_at:
        return True
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        return expires_at < now.replace(tzinfo=None)
    return expires_at < now

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """
    Register a new user account.
    Validates input fields, checks email uniqueness, securely hashes password,
    and returns safe user information and an authentication token.
    Never returns password or password_hash.
    """
    data = request.get_json(silent=True) or {}

    name = data.get("name", "")
    email = data.get("email", "")
    password = data.get("password", "")

    # Input validation
    is_valid, error_message = validate_registration_input(name, email, password)
    if not is_valid:
        return (
            jsonify({
                "status": "error",
                "message": error_message,
            }),
            400,
        )

    normalized_email = email.strip().lower()
    trimmed_name = name.strip()

    try:
        # Check for duplicate email
        existing_user = User.query.filter_by(email=normalized_email).first()
        if existing_user:
            return (
                jsonify({
                    "status": "error",
                    "message": "An account with this email address already exists.",
                }),
                409,
            )

        # Secure password hashing via Werkzeug (pbkdf2:sha256 or scrypt)
        hashed_password = generate_password_hash(password)

        new_user = User(
            name=trimmed_name,
            email=normalized_email,
            password_hash=hashed_password,
            role="user",
            is_active=True,
        )
        db.session.add(new_user)
        db.session.commit()

        # Generate authentication token for immediate session creation
        token = generate_auth_token(new_user.id)

        return (
            jsonify({
                "status": "ok",
                "message": "Account created successfully.",
                "token": token,
                "user": {
                    "id": new_user.id,
                    "name": new_user.name,
                    "email": new_user.email,
                    "role": new_user.role,
                },
            }),
            201,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database connection error during registration: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please check that MySQL is running and DB_PASSWORD is set in backend/.env.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Error during user registration: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not complete registration. Please try again.",
            }),
            500,
        )


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """
    Authenticate an existing user with email and password.
    Returns an authentication token and safe user profile upon success.
    Never reveals whether an email exists through overly specific error messages.
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

    # Generic authentication error to prevent email enumeration
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

        # Generate token
        token = generate_auth_token(user.id)

        return (
            jsonify({
                "status": "ok",
                "message": "Login successful.",
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
        logger.warning("Database connection error during login: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please check that MySQL is running and DB_PASSWORD is set in backend/.env.",
            }),
            503,
        )


@auth_bp.route("/auth/me", methods=["GET"])
@auth_required
def get_current_user_profile():
    """
    Return currently authenticated user's safe profile.
    Requires valid Bearer token.
    Never exposes passwords, hashes, or secrets.
    """
    user = g.current_user
    return (
        jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }),
        200,
    )


@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    """
    Stateless token logout endpoint.
    Client clears stored authentication token upon receiving successful response.
    """
    return (
        jsonify({
            "status": "ok",
            "message": "Logged out successfully.",
        }),
        200,
    )


@auth_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    """
    Initiate password reset flow for a user.
    Validates email format and generates a cryptographically secure, timed, single-use token.
    Stores only the SHA-256 hash of the token in the database.
    Always returns the exact same generic response to prevent user enumeration attacks.
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")

    if not email or not isinstance(email, str) or not email.strip():
        return (
            jsonify({
                "status": "error",
                "message": "Email address is required.",
            }),
            400,
        )

    normalized_email = email.strip().lower()
    if not EMAIL_REGEX.match(normalized_email):
        return (
            jsonify({
                "status": "error",
                "message": "Please enter a valid email address.",
            }),
            400,
        )

    # Rate limiting by IP and by email (max 5 requests per 15 min window)
    client_ip = request.remote_addr or "unknown"
    if not _check_rate_limit(f"ip:{client_ip}") or not _check_rate_limit(f"email:{normalized_email}"):
        logger.warning("Rate limit exceeded for password reset from IP '%s' (email '%s')", client_ip, normalized_email)
        return (
            jsonify({
                "status": "error",
                "message": "Too many password reset requests. Please try again later.",
            }),
            429,
        )

    generic_success = (
        jsonify({
            "status": "ok",
            "message": "If an account exists for that email, a password reset link has been sent.",
        }),
        200,
    )

    try:
        user = User.query.filter_by(email=normalized_email).first()
        if not user or not user.is_active:
            # User does not exist or inactive: return generic response without leaking status
            return generic_success

        # Generate cryptographically secure random token (URL-safe)
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        # Token valid for 30 minutes
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

        user.reset_token_hash = token_hash
        user.reset_token_expires_at = expires_at
        db.session.commit()

        logger.info("Password reset token generated for user #%d (%s)", user.id, user.email)

        # Dispatch email notification via email service
        try:
            send_password_reset_email(user.email, user.name, raw_token)
        except Exception as email_err:
            logger.warning(
                "Password reset email dispatch failed for user #%d: %s",
                user.id,
                type(email_err).__name__,
            )

        return generic_success
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error during forgot-password request: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please try again later.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Unexpected error during forgot-password request: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "An error occurred while processing your request. Please try again.",
            }),
            500,
        )


@auth_bp.route("/auth/verify-reset-token/<token>", methods=["GET"])
def verify_reset_token(token):
    """
    Check if a reset token is valid and unexpired before presenting the reset form.
    """
    if not token or not isinstance(token, str) or not token.strip():
        return (
            jsonify({
                "status": "error",
                "valid": False,
                "message": "This password reset link is invalid or has expired.",
            }),
            400,
        )

    token_hash = hashlib.sha256(token.strip().encode("utf-8")).hexdigest()

    try:
        user = User.query.filter_by(reset_token_hash=token_hash).first()
        if not user or not user.is_active or _is_token_expired(user.reset_token_expires_at):
            return (
                jsonify({
                    "status": "error",
                    "valid": False,
                    "message": "This password reset link is invalid or has expired.",
                }),
                400,
            )

        return (
            jsonify({
                "status": "ok",
                "valid": True,
                "email": user.email,
            }),
            200,
        )
    except Exception as e:
        logger.warning("Error verifying reset token: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "valid": False,
                "message": "This password reset link is invalid or has expired.",
            }),
            400,
        )


@auth_bp.route("/auth/reset-password", methods=["POST"])
def reset_password():
    """
    Reset a user's password using a valid, unexpired single-use token.
    Validates token, enforces minimum 8 characters, matches confirm_password,
    hashes the new password securely, and immediately invalidates the reset token.
    """
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not token:
        return (
            jsonify({
                "status": "error",
                "message": "Reset token is required.",
            }),
            400,
        )

    if not password or not isinstance(password, str):
        return (
            jsonify({
                "status": "error",
                "message": "New password is required.",
            }),
            400,
        )

    if len(password) < 8:
        return (
            jsonify({
                "status": "error",
                "message": "Password must be at least 8 characters long.",
            }),
            400,
        )

    if password != confirm_password:
        return (
            jsonify({
                "status": "error",
                "message": "Passwords do not match.",
            }),
            400,
        )

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    try:
        user = User.query.filter_by(reset_token_hash=token_hash).first()
        if not user or not user.is_active or _is_token_expired(user.reset_token_expires_at):
            return (
                jsonify({
                    "status": "error",
                    "message": "This password reset link is invalid or has expired.",
                }),
                400,
            )

        # Update password hash and immediately invalidate the reset token
        user.password_hash = generate_password_hash(password)
        user.reset_token_hash = None
        user.reset_token_expires_at = None
        db.session.commit()

        logger.info("Password successfully reset for user #%d (%s)", user.id, user.email)

        return (
            jsonify({
                "status": "ok",
                "message": "Your password has been reset successfully.",
            }),
            200,
        )
    except OperationalError as db_err:
        db.session.rollback()
        logger.warning("Database error during password reset: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable. Please try again later.",
            }),
            503,
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Unexpected error during password reset: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not reset your password at this time. Please try again.",
            }),
            500,
        )

