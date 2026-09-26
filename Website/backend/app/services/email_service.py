"""
Email Notification Service
Handles outgoing email notifications for Contact Messages and Project Requests.
Supports standard SMTP with TLS/SSL, HTML & plain-text multipart emails,
defensive error isolation, safe user HTML escaping, and zero credential leakage in logs.
"""

import html
import logging
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Any, Dict, Optional

from app.config import Config

logger = logging.getLogger(__name__)

# Standard RFC-compliant email validation regex
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def is_mail_enabled() -> bool:
    """Return True if email delivery is enabled in application configuration."""
    return bool(getattr(Config, "MAIL_ENABLED", False))


def _is_valid_email(email: Optional[str]) -> bool:
    """Validate email syntax before attempting delivery."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def _escape_safe(value: Any) -> str:
    """Safely escape text for HTML templates, returning empty string for None."""
    if value is None:
        return ""
    return html.escape(str(value).strip())


def _send_email(
    to_email: str,
    subject: str,
    plain_text: str,
    html_content: Optional[str] = None,
) -> bool:
    """
    Reusable SMTP delivery helper.
    Constructs a multipart MIME email and dispatches it via configured SMTP server.
    Ensures safe error logging without credential leakage.
    """
    if not is_mail_enabled():
        logger.debug("Email delivery skipped: MAIL_ENABLED is false.")
        return False

    to_email = (to_email or "").strip()
    if not _is_valid_email(to_email):
        logger.warning("Email delivery skipped: Invalid recipient email address.")
        return False

    mail_host = (getattr(Config, "MAIL_HOST", "") or "").strip()
    mail_port = getattr(Config, "MAIL_PORT", 587) or 587
    mail_username = (getattr(Config, "MAIL_USERNAME", "") or "").strip()
    mail_password = (getattr(Config, "MAIL_PASSWORD", "") or "").strip()
    mail_use_tls = getattr(Config, "MAIL_USE_TLS", True)
    mail_from = (getattr(Config, "MAIL_FROM", "") or mail_username or "no-reply@sivakumar.dev").strip()
    mail_from_name = (getattr(Config, "MAIL_FROM_NAME", "Siva Kumar") or "Siva Kumar").strip()

    if not mail_host:
        logger.warning("Email delivery skipped: MAIL_HOST is not configured.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr((mail_from_name, mail_from))
    msg["To"] = to_email

    # Plain text version (fallback for clients with HTML disabled)
    msg.attach(MIMEText(plain_text, "plain", "utf-8"))

    # HTML version for rich email formatting
    if html_content:
        msg.attach(MIMEText(html_content, "html", "utf-8"))

    server = None
    try:
        if mail_port == 465:
            server = smtplib.SMTP_SSL(mail_host, mail_port, timeout=10)
            server.ehlo()
        else:
            server = smtplib.SMTP(mail_host, mail_port, timeout=10)
            server.ehlo()
            if mail_use_tls:
                server.starttls()
                server.ehlo()

        if mail_username and mail_password:
            server.login(mail_username, mail_password)

        server.sendmail(mail_from, [to_email], msg.as_string())
        logger.info("Email successfully dispatched to %s (Subject: '%s')", to_email, subject)
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(
            "SMTP authentication failed during email delivery to %s: %s",
            to_email,
            type(auth_err).__name__,
        )
        return False
    except smtplib.SMTPException as smtp_err:
        logger.error(
            "SMTP protocol error delivering email to %s: %s",
            to_email,
            type(smtp_err).__name__,
        )
        return False
    except Exception as err:
        logger.error(
            "Unexpected error delivering email to %s: %s",
            to_email,
            type(err).__name__,
        )
        return False
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass


# ==============================================================================
# Contact Message Notifications
# ==============================================================================


def send_admin_contact_notification(contact_data: Dict[str, Any]) -> bool:
    """
    Send email notification to configured administrator when a new contact message is saved.
    Includes only submitted fields: Name, Email, Subject, Message, Submitted Time.
    Does NOT include secrets, passwords, or authentication tokens.
    """
    if not is_mail_enabled():
        return False

    admin_email = (getattr(Config, "ADMIN_NOTIFICATION_EMAIL", "") or getattr(Config, "MAIL_FROM", "")).strip()
    if not admin_email or not _is_valid_email(admin_email):
        logger.warning("Admin contact notification skipped: ADMIN_NOTIFICATION_EMAIL is not set or invalid.")
        return False

    name = _escape_safe(contact_data.get("name"))
    email = _escape_safe(contact_data.get("email"))
    subject = _escape_safe(contact_data.get("subject"))
    message = _escape_safe(contact_data.get("message"))
    submitted_at = _escape_safe(contact_data.get("created_at") or "Just now")

    email_subject = "New Contact Message — Siva Kumar Website"

    plain_text = (
        f"New Contact Message — Siva Kumar Website\n"
        f"----------------------------------------\n"
        f"Name: {contact_data.get('name', '')}\n"
        f"Email: {contact_data.get('email', '')}\n"
        f"Subject: {contact_data.get('subject', '')}\n"
        f"Submitted: {contact_data.get('created_at', 'Just now')}\n\n"
        f"Message:\n"
        f"{contact_data.get('message', '')}\n"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F5; margin: 0; padding: 24px; color: #121A24;">
  <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(18, 26, 36, 0.12); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #121A24; border-bottom: 1px solid rgba(18, 26, 36, 0.08); padding-bottom: 12px;">
      New Contact Message
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #64748B; width: 110px;"><strong>Name:</strong></td>
        <td style="padding: 6px 0; color: #121A24;">{name}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Email:</strong></td>
        <td style="padding: 6px 0; color: #121A24;"><a href="mailto:{email}" style="color: #1D4ED8; text-decoration: none;">{email}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Subject:</strong></td>
        <td style="padding: 6px 0; color: #121A24;">{subject}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Submitted:</strong></td>
        <td style="padding: 6px 0; color: #64748B;">{submitted_at}</td>
      </tr>
    </table>
    <div style="background-color: #F8FAFC; border: 1px solid rgba(18, 26, 36, 0.08); border-radius: 8px; padding: 16px; margin-top: 8px;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 8px; letter-spacing: 0.04em;">Message Content</div>
      <div style="font-size: 14px; line-height: 1.6; color: #121A24; white-space: pre-wrap;">{message}</div>
    </div>
  </div>
</body>
</html>"""

    return _send_email(admin_email, email_subject, plain_text, html_content)


def send_contact_acknowledgement(contact_data: Dict[str, Any]) -> bool:
    """
    Send polite confirmation receipt to visitor acknowledging that their message was received.
    Keeps copy factual without promising specific response times or commitments.
    """
    if not is_mail_enabled():
        return False

    recipient_email = (contact_data.get("email") or "").strip()
    if not _is_valid_email(recipient_email):
        return False

    recipient_name = contact_data.get("name", "there").strip() or "there"
    safe_name = _escape_safe(recipient_name)

    email_subject = "We received your message — Siva Kumar"

    plain_text = (
        f"Hi {recipient_name},\n\n"
        f"Thanks for reaching out. Your request has been received and is now recorded. "
        f"I'll review the details and follow up through the contact information you provided.\n\n"
        f"Best regards,\n"
        f"Siva Kumar"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F5; margin: 0; padding: 24px; color: #121A24;">
  <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(18, 26, 36, 0.12); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #121A24;">
      Thank You for Reaching Out
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hi {safe_name},
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Thanks for reaching out. Your request has been received and is now recorded. I'll review the details and follow up through the contact information you provided.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #64748B; margin-top: 24px; border-top: 1px solid rgba(18, 26, 36, 0.08); padding-top: 16px;">
      Best regards,<br>
      <strong style="color: #121A24;">Siva Kumar</strong>
    </p>
  </div>
</body>
</html>"""

    return _send_email(recipient_email, email_subject, plain_text, html_content)


# ==============================================================================
# Project Request Notifications
# ==============================================================================


def send_admin_project_request_notification(request_data: Dict[str, Any]) -> bool:
    """
    Send email notification to configured administrator when a new project request is saved.
    Includes:
      Project Type, Project Name, Problem/Requirement, Features, Timeline, Budget,
      Technology Preference, Additional Requirements, Client Name, Client Email,
      Client Phone (if provided), Submitted Time.
    Strictly excludes:
      admin_notes, authentication tokens, passwords, and internal secrets.
    """
    if not is_mail_enabled():
        return False

    admin_email = (getattr(Config, "ADMIN_NOTIFICATION_EMAIL", "") or getattr(Config, "MAIL_FROM", "")).strip()
    if not admin_email or not _is_valid_email(admin_email):
        logger.warning("Admin project request notification skipped: ADMIN_NOTIFICATION_EMAIL is not set or invalid.")
        return False

    project_type = _escape_safe(request_data.get("project_type"))
    project_name = _escape_safe(request_data.get("project_name"))
    requirement = _escape_safe(request_data.get("requirement"))
    features = _escape_safe(request_data.get("features"))
    timeline = _escape_safe(request_data.get("timeline"))
    budget = _escape_safe(request_data.get("budget_range"))
    tech_pref = _escape_safe(request_data.get("technology_preference"))
    additional_reqs = _escape_safe(request_data.get("additional_requirements"))
    client_name = _escape_safe(request_data.get("name"))
    client_email = _escape_safe(request_data.get("email"))
    client_phone = _escape_safe(request_data.get("phone"))
    submitted_at = _escape_safe(request_data.get("created_at") or "Just now")

    email_subject = "New Project Request — Siva Kumar Website"

    plain_lines = [
        "New Project Request — Siva Kumar Website",
        "----------------------------------------",
        f"Project Type: {request_data.get('project_type', '')}",
        f"Project Name: {request_data.get('project_name', '')}",
        f"Client Name: {request_data.get('name', '')}",
        f"Client Email: {request_data.get('email', '')}",
    ]
    if request_data.get("phone"):
        plain_lines.append(f"Client Phone: {request_data.get('phone')}")
    if request_data.get("timeline"):
        plain_lines.append(f"Timeline: {request_data.get('timeline')}")
    if request_data.get("budget_range"):
        plain_lines.append(f"Budget: {request_data.get('budget_range')}")
    if request_data.get("technology_preference"):
        plain_lines.append(f"Technology Preference: {request_data.get('technology_preference')}")
    plain_lines.append(f"Submitted: {request_data.get('created_at', 'Just now')}")
    plain_lines.append("")
    plain_lines.append("Problem / Requirement:")
    plain_lines.append(f"{request_data.get('requirement', '')}")
    if request_data.get("features"):
        plain_lines.append("")
        plain_lines.append("Requested Features:")
        plain_lines.append(f"{request_data.get('features')}")
    if request_data.get("additional_requirements"):
        plain_lines.append("")
        plain_lines.append("Additional Requirements:")
        plain_lines.append(f"{request_data.get('additional_requirements')}")

    plain_text = "\n".join(plain_lines)

    # Optional rows for HTML
    optional_rows = ""
    if client_phone:
        optional_rows += f"""<tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Client Phone:</strong></td>
          <td style="padding: 6px 0; color: #121A24;">{client_phone}</td>
        </tr>"""
    if timeline:
        optional_rows += f"""<tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Timeline:</strong></td>
          <td style="padding: 6px 0; color: #121A24;">{timeline}</td>
        </tr>"""
    if budget:
        optional_rows += f"""<tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Budget:</strong></td>
          <td style="padding: 6px 0; color: #121A24;">{budget}</td>
        </tr>"""
    if tech_pref:
        optional_rows += f"""<tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Tech Preference:</strong></td>
          <td style="padding: 6px 0; color: #121A24;">{tech_pref}</td>
        </tr>"""

    optional_sections = ""
    if features:
        optional_sections += f"""
        <div style="background-color: #F8FAFC; border: 1px solid rgba(18, 26, 36, 0.08); border-radius: 8px; padding: 14px; margin-top: 12px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 6px; letter-spacing: 0.04em;">Requested Features</div>
          <div style="font-size: 14px; line-height: 1.5; color: #121A24; white-space: pre-wrap;">{features}</div>
        </div>"""
    if additional_reqs:
        optional_sections += f"""
        <div style="background-color: #F8FAFC; border: 1px solid rgba(18, 26, 36, 0.08); border-radius: 8px; padding: 14px; margin-top: 12px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 6px; letter-spacing: 0.04em;">Additional Requirements</div>
          <div style="font-size: 14px; line-height: 1.5; color: #121A24; white-space: pre-wrap;">{additional_reqs}</div>
        </div>"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F5; margin: 0; padding: 24px; color: #121A24;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(18, 26, 36, 0.12); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #121A24; border-bottom: 1px solid rgba(18, 26, 36, 0.08); padding-bottom: 12px;">
      New Project Request
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #64748B; width: 140px;"><strong>Project Name:</strong></td>
        <td style="padding: 6px 0; color: #121A24;"><strong>{project_name}</strong></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Project Type:</strong></td>
        <td style="padding: 6px 0; color: #121A24;">{project_type}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Client Name:</strong></td>
        <td style="padding: 6px 0; color: #121A24;">{client_name}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Client Email:</strong></td>
        <td style="padding: 6px 0; color: #121A24;"><a href="mailto:{client_email}" style="color: #1D4ED8; text-decoration: none;">{client_email}</a></td>
      </tr>
      {optional_rows}
      <tr>
        <td style="padding: 6px 0; color: #64748B;"><strong>Submitted:</strong></td>
        <td style="padding: 6px 0; color: #64748B;">{submitted_at}</td>
      </tr>
    </table>

    <div style="background-color: #F8FAFC; border: 1px solid rgba(18, 26, 36, 0.08); border-radius: 8px; padding: 14px; margin-top: 12px;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 6px; letter-spacing: 0.04em;">Problem / Requirement</div>
      <div style="font-size: 14px; line-height: 1.5; color: #121A24; white-space: pre-wrap;">{requirement}</div>
    </div>
    {optional_sections}
  </div>
</body>
</html>"""

    return _send_email(admin_email, email_subject, plain_text, html_content)


def send_project_request_acknowledgement(request_data: Dict[str, Any]) -> bool:
    """
    Send polite confirmation receipt to visitor acknowledging that their project request was received.
    Keeps copy factual without promising specific response times, acceptance, or prices.
    Strictly excludes admin_notes.
    """
    if not is_mail_enabled():
        return False

    recipient_email = (request_data.get("email") or "").strip()
    if not _is_valid_email(recipient_email):
        return False

    recipient_name = request_data.get("name", "there").strip() or "there"
    safe_name = _escape_safe(recipient_name)
    project_name = _escape_safe(request_data.get("project_name") or "your project")

    email_subject = "We received your project request — Siva Kumar"

    plain_text = (
        f"Hi {recipient_name},\n\n"
        f"Thanks for reaching out regarding {request_data.get('project_name', 'your project')}. "
        f"Your request has been received and is now recorded. "
        f"I'll review the details and follow up through the contact information you provided.\n\n"
        f"Best regards,\n"
        f"Siva Kumar"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F5; margin: 0; padding: 24px; color: #121A24;">
  <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(18, 26, 36, 0.12); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #121A24;">
      Project Request Received
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hi {safe_name},
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Thanks for reaching out regarding <strong>{project_name}</strong>. Your request has been received and is now recorded. I'll review the details and follow up through the contact information you provided.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #64748B; margin-top: 24px; border-top: 1px solid rgba(18, 26, 36, 0.08); padding-top: 16px;">
      Best regards,<br>
      <strong style="color: #121A24;">Siva Kumar</strong>
    </p>
  </div>
</body>
</html>"""

    return _send_email(recipient_email, email_subject, plain_text, html_content)


# ==============================================================================
# Password Reset Notifications
# ==============================================================================


def send_password_reset_email(to_email: str, recipient_name: str, raw_token: str) -> bool:
    """
    Send password reset email to a user containing a secure single-use reset link.
    Constructs the target URL using FRONTEND_BASE_URL.
    Strictly excludes passwords, hashes, roles, and internal IDs.
    """
    if not is_mail_enabled():
        return False

    recipient_email = (to_email or "").strip()
    if not _is_valid_email(recipient_email):
        return False

    name = recipient_name.strip() if recipient_name else "there"
    is_prod = getattr(Config, "IS_PRODUCTION", False)
    default_url = "https://pikkilisivakumar.com" if is_prod else "http://localhost:5173"
    frontend_base = (getattr(Config, "FRONTEND_BASE_URL", default_url) or default_url).rstrip("/")
    reset_url = f"{frontend_base}/reset-password/{raw_token}"

    email_subject = "Reset your password — Siva Kumar"

    plain_text = (
        f"Hi {name},\n\n"
        f"You requested a password reset. Use the link below to create a new password.\n\n"
        f"Reset Password → {reset_url}\n\n"
        f"This link will expire in 30 minutes and can only be used once.\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"Best regards,\n"
        f"Siva Kumar"
    )

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{email_subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F5; margin: 0; padding: 24px; color: #121A24;">
  <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(18, 26, 36, 0.12); border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #121A24;">
      Password Reset Request
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hi {safe_name},
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
      You requested a password reset. Use the link below to create a new password:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{reset_url}" style="display: inline-block; background-color: #121A24; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
        Reset Password &rarr;
      </a>
    </div>
    <p style="font-size: 12px; line-height: 1.5; color: #64748B; margin-top: 24px; border-top: 1px solid rgba(18, 26, 36, 0.08); padding-top: 16px;">
      This link will expire in 30 minutes and can only be used once.<br>
      If you did not request a password reset, you can safely ignore this email.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #64748B; margin-top: 16px;">
      Best regards,<br>
      <strong style="color: #121A24;">Siva Kumar</strong>
    </p>
  </div>
</body>
</html>"""

    return _send_email(recipient_email, email_subject, plain_text, html_content)

