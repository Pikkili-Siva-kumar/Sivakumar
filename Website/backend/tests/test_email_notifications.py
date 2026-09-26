"""
Unit and Integration Tests for Production-Ready Email Notifications
Tests both disabled state (MAIL_ENABLED=false) and enabled state with mock SMTP.
Verifies failure resilience, payload accuracy, HTML escaping, and zero credential leakage.
"""

from email import message_from_string
from email.header import decode_header
import logging
import os
import smtplib
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.config import Config
from app.extensions import db
from app.models.contact_message import ContactMessage
from app.models.project_request import ProjectRequest
from app.services.email_service import (
    is_mail_enabled,
    send_admin_contact_notification,
    send_contact_acknowledgement,
    send_admin_project_request_notification,
    send_project_request_acknowledgement,
    _send_email,
)


def parse_mime_message(msg_str: str):
    """Parse raw wire MIME string into headers, plain text, and HTML body."""
    msg = message_from_string(msg_str)
    decoded_parts = decode_header(msg.get("Subject", ""))
    subject = "".join(
        part.decode(encoding or "utf-8") if isinstance(part, bytes) else part
        for part, encoding in decoded_parts
    )
    plain_text = ""
    html_text = ""
    if msg.is_multipart():
        for part in msg.get_payload():
            ctype = part.get_content_type()
            payload = part.get_payload(decode=True)
            if payload:
                text = payload.decode("utf-8", errors="replace")
                if ctype == "text/plain":
                    plain_text = text
                elif ctype == "text/html":
                    html_text = text
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            plain_text = payload.decode("utf-8", errors="replace")
    return msg, subject, plain_text, html_text


class TestEmailNotifications(unittest.TestCase):
    """Test suite for Email Service and Notification Workflows."""

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    # --------------------------------------------------------------------------
    # 1. MAIL_ENABLED=false Tests
    # --------------------------------------------------------------------------

    @patch("smtplib.SMTP")
    def test_mail_disabled_does_not_attempt_smtp(self, mock_smtp):
        """When MAIL_ENABLED=false, no SMTP connection is ever opened."""
        with patch.object(Config, "MAIL_ENABLED", False):
            self.assertFalse(is_mail_enabled())

            contact_payload = {
                "name": "Alex Miller",
                "email": "alex@example.com",
                "subject": "Inquiry",
                "message": "Hello world",
                "created_at": "2026-09-26T08:00:00Z",
            }
            res_admin = send_admin_contact_notification(contact_payload)
            res_ack = send_contact_acknowledgement(contact_payload)

            self.assertFalse(res_admin)
            self.assertFalse(res_ack)
            mock_smtp.assert_not_called()

    @patch("smtplib.SMTP")
    def test_contact_submission_succeeds_when_mail_disabled(self, mock_smtp):
        """Contact message submission returns 201, creates DB record, no SMTP attempted."""
        with patch.object(Config, "MAIL_ENABLED", False):
            payload = {
                "name": "Test User",
                "email": "testuser@example.com",
                "subject": "Project Collaboration",
                "message": "Let us collaborate on an innovative solution.",
            }
            response = self.client.post("/api/contact-messages", json=payload)
            self.assertEqual(response.status_code, 201)

            data = response.get_json()
            self.assertEqual(data["status"], "ok")
            self.assertEqual(data["message"], "Message sent successfully.")
            self.assertIn("message_id", data)

            # Verify in DB
            msg = db.session.get(ContactMessage, data["message_id"])
            self.assertIsNotNone(msg)
            self.assertEqual(msg.email, "testuser@example.com")
            self.assertEqual(msg.subject, "Project Collaboration")

            # Verify zero SMTP calls
            mock_smtp.assert_not_called()

    @patch("smtplib.SMTP")
    def test_project_request_submission_succeeds_when_mail_disabled(self, mock_smtp):
        """Project request submission returns 201, creates DB record, no SMTP attempted."""
        with patch.object(Config, "MAIL_ENABLED", False):
            payload = {
                "project_type": "Full-Stack Web App",
                "project_name": "Cloud Dashboard System",
                "requirement": "Need a responsive dashboard with analytics and reporting.",
                "name": "Sarah Connor",
                "email": "sarah@example.com",
                "features": "Auth, Real-time metrics, Export",
                "timeline": "3 months",
                "budget_range": "$10,000 - $15,000",
            }
            response = self.client.post("/api/project-requests", json=payload)
            self.assertEqual(response.status_code, 201)

            data = response.get_json()
            self.assertEqual(data["status"], "ok")
            self.assertEqual(data["message"], "Project request submitted successfully.")
            self.assertIn("request_id", data)

            # Verify in DB
            req = db.session.get(ProjectRequest, data["request_id"])
            self.assertIsNotNone(req)
            self.assertEqual(req.name, "Sarah Connor")
            self.assertEqual(req.project_name, "Cloud Dashboard System")

            # Verify zero SMTP calls
            mock_smtp.assert_not_called()

    # --------------------------------------------------------------------------
    # 2. Mock SMTP Layer: Payload Accuracy & Delivery
    # --------------------------------------------------------------------------

    @patch("smtplib.SMTP")
    def test_admin_contact_notification_payload(self, mock_smtp_class):
        """Admin contact notification sends correct subject, recipients, and escaped fields."""
        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"), \
             patch.object(Config, "MAIL_PORT", 587), \
             patch.object(Config, "MAIL_USERNAME", "mailer@sivakumar.dev"), \
             patch.object(Config, "MAIL_PASSWORD", "secret_pass_123"), \
             patch.object(Config, "ADMIN_NOTIFICATION_EMAIL", "admin@sivakumar.dev"):

            contact_data = {
                "id": 101,
                "name": "Jane Doe",
                "email": "jane@example.com",
                "subject": "Partnership Inquiry",
                "message": "Looking to partner on AI architecture.",
                "created_at": "2026-09-26T09:00:00Z",
            }

            result = send_admin_contact_notification(contact_data)
            self.assertTrue(result)
            self.assertTrue(mock_server.sendmail.called)

            args, _ = mock_server.sendmail.call_args
            sender, recipients, msg_str = args
            self.assertEqual(recipients, ["admin@sivakumar.dev"])

            msg, subject, plain_text, html_text = parse_mime_message(msg_str)
            self.assertEqual(subject, "New Contact Message — Siva Kumar Website")
            self.assertIn("Jane Doe", plain_text)
            self.assertIn("Partnership Inquiry", plain_text)
            self.assertIn("Looking to partner on AI architecture.", plain_text)
            self.assertIn("Jane Doe", html_text)

    @patch("smtplib.SMTP")
    def test_admin_project_request_notification_payload(self, mock_smtp_class):
        """Admin project request notification includes required fields and excludes admin_notes."""
        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"), \
             patch.object(Config, "ADMIN_NOTIFICATION_EMAIL", "admin@sivakumar.dev"):

            project_data = {
                "id": 202,
                "project_type": "AI Platform",
                "project_name": "Autonomous Drone Fleet",
                "requirement": "Real-time object detection and pathfinding system.",
                "features": "Low latency video, edge inference",
                "timeline": "4 months",
                "budget_range": "$25,000+",
                "technology_preference": "PyTorch, FastAPI, C++",
                "additional_requirements": "Strict NDA required",
                "name": "Bruce Wayne",
                "email": "bruce@wayne-enterprises.com",
                "phone": "+1-555-0199",
                "admin_notes": "SENSITIVE_INTERNAL_ADMIN_NOTE_DO_NOT_LEAK",
                "created_at": "2026-09-26T09:15:00Z",
            }

            result = send_admin_project_request_notification(project_data)
            self.assertTrue(result)
            self.assertTrue(mock_server.sendmail.called)

            _, recipients, msg_str = mock_server.sendmail.call_args[0]
            self.assertEqual(recipients, ["admin@sivakumar.dev"])

            msg, subject, plain_text, html_text = parse_mime_message(msg_str)
            self.assertEqual(subject, "New Project Request — Siva Kumar Website")
            self.assertIn("Autonomous Drone Fleet", plain_text)
            self.assertIn("Bruce Wayne", plain_text)
            self.assertIn("+1-555-0199", plain_text)
            self.assertIn("Autonomous Drone Fleet", html_text)
            # CRITICAL: Verify admin_notes is NEVER in outgoing email!
            self.assertNotIn("SENSITIVE_INTERNAL_ADMIN_NOTE_DO_NOT_LEAK", plain_text)
            self.assertNotIn("SENSITIVE_INTERNAL_ADMIN_NOTE_DO_NOT_LEAK", html_text)

    @patch("smtplib.SMTP")
    def test_visitor_contact_acknowledgement(self, mock_smtp_class):
        """Visitor acknowledgement sends polite factual receipt without promises."""
        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"):

            contact_data = {
                "name": "Elena Rostova",
                "email": "elena@example.com",
                "subject": "Consultation",
                "message": "Let us talk next week.",
            }

            result = send_contact_acknowledgement(contact_data)
            self.assertTrue(result)

            _, recipients, msg_str = mock_server.sendmail.call_args[0]
            self.assertEqual(recipients, ["elena@example.com"])

            msg, subject, plain_text, html_text = parse_mime_message(msg_str)
            self.assertEqual(subject, "We received your message — Siva Kumar")
            self.assertIn("Your request has been received and is now recorded.", plain_text)
            self.assertIn("Your request has been received and is now recorded.", html_text)

    @patch("smtplib.SMTP")
    def test_visitor_project_request_acknowledgement(self, mock_smtp_class):
        """Visitor project request acknowledgement sends confirmation with project name."""
        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"):

            project_data = {
                "project_name": "HealthTracker Pro",
                "name": "Dr. Watson",
                "email": "watson@clinic.org",
                "admin_notes": "PRIVATE_NOTE",
            }

            result = send_project_request_acknowledgement(project_data)
            self.assertTrue(result)

            _, recipients, msg_str = mock_server.sendmail.call_args[0]
            self.assertEqual(recipients, ["watson@clinic.org"])

            msg, subject, plain_text, html_text = parse_mime_message(msg_str)
            self.assertEqual(subject, "We received your project request — Siva Kumar")
            self.assertIn("HealthTracker Pro", plain_text)
            self.assertIn("HealthTracker Pro", html_text)
            self.assertNotIn("PRIVATE_NOTE", plain_text)
            self.assertNotIn("PRIVATE_NOTE", html_text)

    # --------------------------------------------------------------------------
    # 3. HTML Escaping & Security Tests
    # --------------------------------------------------------------------------

    @patch("smtplib.SMTP")
    def test_html_escaping_prevents_xss_in_emails(self, mock_smtp_class):
        """All user inputs in HTML emails must be escaped to prevent injection."""
        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"), \
             patch.object(Config, "ADMIN_NOTIFICATION_EMAIL", "admin@sivakumar.dev"):

            malicious_data = {
                "name": "<script>alert('xss')</script>",
                "email": "hacker@test.com",
                "subject": "<b onmouseover=alert(1)>Bold</b>",
                "message": "<img src=x onerror=alert('hack')>",
            }

            send_admin_contact_notification(malicious_data)
            _, _, msg_str = mock_server.sendmail.call_args[0]

            _, _, _, html_text = parse_mime_message(msg_str)
            self.assertNotIn("<script>", html_text)
            self.assertIn("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;", html_text)
            self.assertNotIn("<b onmouseover", html_text)
            self.assertNotIn("<img src=x", html_text)

    def test_missing_or_invalid_visitor_email_handled_safely(self):
        """Missing or invalid visitor email is safely skipped without throwing."""
        with patch.object(Config, "MAIL_ENABLED", True):
            self.assertFalse(send_contact_acknowledgement({"email": ""}))
            self.assertFalse(send_contact_acknowledgement({"email": "not-an-email"}))
            self.assertFalse(send_contact_acknowledgement({"email": None}))
            self.assertFalse(send_project_request_acknowledgement({"email": "invalid"}))

    # --------------------------------------------------------------------------
    # 4. Failure Resilience: DB Submission Never Fails on Email Errors
    # --------------------------------------------------------------------------

    @patch("smtplib.SMTP")
    def test_email_failure_does_not_fail_contact_submission(self, mock_smtp_class):
        """If SMTP throws an authentication or network error, contact submission still succeeds."""
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"Invalid credentials")
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"), \
             patch.object(Config, "MAIL_USERNAME", "user"), \
             patch.object(Config, "MAIL_PASSWORD", "super_secret_password_123"):

            payload = {
                "name": "Resilient User",
                "email": "resilient@example.com",
                "subject": "Failure Test",
                "message": "Testing submission when SMTP fails.",
            }

            response = self.client.post("/api/contact-messages", json=payload)
            # Response must still be 201 Created!
            self.assertEqual(response.status_code, 201)
            data = response.get_json()
            self.assertEqual(data["status"], "ok")
            self.assertIn("message_id", data)

            # DB record exists
            record = db.session.get(ContactMessage, data["message_id"])
            self.assertIsNotNone(record)

    @patch("smtplib.SMTP")
    def test_email_failure_does_not_fail_project_request_submission(self, mock_smtp_class):
        """If SMTP connection fails, project request submission still succeeds."""
        mock_smtp_class.side_effect = smtplib.SMTPConnectError(421, b"Service not available")

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"):

            payload = {
                "project_type": "Consulting",
                "project_name": "Infrastructure Audit",
                "requirement": "Evaluate cloud infrastructure security.",
                "name": "Reliable Client",
                "email": "reliable@example.com",
            }

            response = self.client.post("/api/project-requests", json=payload)
            self.assertEqual(response.status_code, 201)
            data = response.get_json()
            self.assertEqual(data["status"], "ok")
            self.assertIn("request_id", data)

            # DB record exists
            record = db.session.get(ProjectRequest, data["request_id"])
            self.assertIsNotNone(record)

    # --------------------------------------------------------------------------
    # 5. Zero Credential Leakage in Logs
    # --------------------------------------------------------------------------

    @patch("smtplib.SMTP")
    def test_no_credentials_leak_into_logs(self, mock_smtp_class):
        """Sensitive credentials like passwords must never appear in log records."""
        secret_password = "super_secret_smtp_password_999"
        mock_server = MagicMock()
        mock_server.login.side_effect = Exception(f"Failed to authenticate user with {secret_password}")
        mock_smtp_class.return_value = mock_server

        with patch.object(Config, "MAIL_ENABLED", True), \
             patch.object(Config, "MAIL_HOST", "smtp.example.com"), \
             patch.object(Config, "MAIL_USERNAME", "mailer_user"), \
             patch.object(Config, "MAIL_PASSWORD", secret_password), \
             self.assertLogs("app.services.email_service", level="ERROR") as cm:

            _send_email("recipient@example.com", "Test", "Plain text")

            # Verify that secret_password was NOT logged
            for log_msg in cm.output:
                self.assertNotIn(secret_password, log_msg)


if __name__ == "__main__":
    unittest.main()
