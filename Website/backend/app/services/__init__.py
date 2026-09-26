"""
Services Package
Exports business logic services including authentication and authorization.
"""
from app.services.auth_service import (
    admin_required,
    auth_required,
    generate_auth_token,
    verify_auth_token,
    validate_registration_input,
)
from app.services.email_service import (
    is_mail_enabled,
    send_admin_contact_notification,
    send_contact_acknowledgement,
    send_admin_project_request_notification,
    send_project_request_acknowledgement,
    send_password_reset_email,
)

__all__ = [
    "admin_required",
    "auth_required",
    "generate_auth_token",
    "verify_auth_token",
    "validate_registration_input",
    "is_mail_enabled",
    "send_admin_contact_notification",
    "send_contact_acknowledgement",
    "send_admin_project_request_notification",
    "send_project_request_acknowledgement",
    "send_password_reset_email",
]

