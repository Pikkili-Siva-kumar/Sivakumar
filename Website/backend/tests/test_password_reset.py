"""
Unit and Integration Tests for Secure Password Reset
Step 41: Build Secure Password Reset

Validates all 13 required test cases:
1. Existing user requests reset -> 200 generic message, reset_token_hash and reset_token_expires_at in DB
2. Non-existent user requests reset -> 200 identical generic response, no token created
3. Invalid email syntax -> 400 error
4. Expired token -> rejected with 400
5. Invalid token -> rejected with 400
6. Reused token -> rejected with 400
7. Valid token resets password successfully -> 200
8. Password mismatch rejected -> 400
9. Weak password (<8 chars) rejected -> 400
10. Successful reset changes password hash
11. Login with new password succeeds -> 200
12. Old password fails authentication -> 401
13. Token invalidated after use -> reset_token_hash and reset_token_expires_at are NULL
"""

import hashlib
import os
import secrets
import sys
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from werkzeug.security import check_password_hash, generate_password_hash

from app import create_app
from app.extensions import db
from app.models.user import User
from app.routes.auth import _reset_rate_limits


class TestPasswordReset(unittest.TestCase):
    """Test suite for Step 41 Secure Password Reset functionality."""

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        self.app_context = self.app.app_context()
        self.app_context.push()
        _reset_rate_limits.clear()

        # Create or retrieve test user
        self.test_email = "pwdreset_tester@example.com"
        self.initial_password = "InitialPassword123!"

        # Ensure no leftover user from prior failed run
        existing = User.query.filter_by(email=self.test_email).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()

        self.user = User(
            name="Reset Test User",
            email=self.test_email,
            password_hash=generate_password_hash(self.initial_password),
            role="user",
            is_active=True,
        )
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        try:
            user = User.query.filter_by(email=self.test_email).first()
            if user:
                db.session.delete(user)
                db.session.commit()
        except Exception:
            db.session.rollback()
        finally:
            _reset_rate_limits.clear()
            self.app_context.pop()

    # --------------------------------------------------------------------------
    # 1. Existing user requests reset
    # --------------------------------------------------------------------------
    @patch("app.routes.auth.send_password_reset_email")
    def test_01_existing_user_requests_reset(self, mock_send_email):
        """Existing user receives 200 generic message; token is generated, hashed, and stored in DB."""
        mock_send_email.return_value = True

        response = self.client.post(
            "/api/auth/forgot-password",
            json={"email": self.test_email},
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("If an account exists for that email, a password reset link has been sent.", data["message"])

        # Check DB state
        db.session.refresh(self.user)
        self.assertIsNotNone(self.user.reset_token_hash)
        self.assertEqual(len(self.user.reset_token_hash), 64)  # SHA-256 hex string
        self.assertIsNotNone(self.user.reset_token_expires_at)
        
        # Expiration must be approximately 30 minutes in future
        now_utc = datetime.now(timezone.utc)
        expires_at = self.user.reset_token_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        time_diff = (expires_at - now_utc).total_seconds()
        self.assertTrue(25 * 60 <= time_diff <= 31 * 60)

        # Mock email should have been called with token
        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args[0]
        self.assertEqual(call_args[0], self.test_email)
        raw_token = call_args[2]
        # Verify raw token hashes to the stored hash
        computed_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        self.assertEqual(computed_hash, self.user.reset_token_hash)

    # --------------------------------------------------------------------------
    # 2. Non-existent user requests reset (Anti-enumeration)
    # --------------------------------------------------------------------------
    @patch("app.routes.auth.send_password_reset_email")
    def test_02_nonexistent_user_requests_reset(self, mock_send_email):
        """Non-existent user receives identical 200 generic response with zero email leakage or token creation."""
        nonexistent_email = "nonexistent_ghost_user_9876@example.com"
        response = self.client.post(
            "/api/auth/forgot-password",
            json={"email": nonexistent_email},
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(
            data["message"],
            "If an account exists for that email, a password reset link has been sent.",
        )
        mock_send_email.assert_not_called()

        # Verify no token was created for nonexistent user
        user = User.query.filter_by(email=nonexistent_email).first()
        self.assertIsNone(user)

    # --------------------------------------------------------------------------
    # 3. Invalid email syntax rejected with 400
    # --------------------------------------------------------------------------
    def test_03_invalid_email_syntax_rejected(self):
        """Malformed email inputs are rejected with 400 Bad Request."""
        invalid_emails = ["notanemail", "plainaddress@", "@missingusername.com", "user@.com", "   "]
        for email in invalid_emails:
            response = self.client.post(
                "/api/auth/forgot-password",
                json={"email": email},
            )
            self.assertEqual(response.status_code, 400, f"Failed to reject invalid email: {email}")
            data = response.get_json()
            self.assertEqual(data["status"], "error")

    # --------------------------------------------------------------------------
    # 4. Expired token rejected with 400
    # --------------------------------------------------------------------------
    def test_04_expired_token_rejected(self):
        """Tokens past their 30-minute expiry are rejected on verify and reset."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        # Set expiry to 10 minutes in the past
        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) - timedelta(minutes=10)
        db.session.commit()

        # Verify endpoint check
        verify_resp = self.client.get(f"/api/auth/verify-reset-token/{raw_token}")
        self.assertEqual(verify_resp.status_code, 400)
        verify_data = verify_resp.get_json()
        self.assertFalse(verify_data.get("valid"))
        self.assertIn("invalid or has expired", verify_data.get("message", ""))

        # Reset password check
        reset_resp = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "NewValidPassword123!",
                "confirm_password": "NewValidPassword123!",
            },
        )
        self.assertEqual(reset_resp.status_code, 400)
        reset_data = reset_resp.get_json()
        self.assertEqual(reset_data["status"], "error")
        self.assertIn("invalid or has expired", reset_data.get("message", ""))

    # --------------------------------------------------------------------------
    # 5. Invalid token rejected with 400
    # --------------------------------------------------------------------------
    def test_05_invalid_token_rejected(self):
        """Random or malformed tokens are rejected with 400."""
        invalid_token = "completely_bogus_token_abcdef123456"

        verify_resp = self.client.get(f"/api/auth/verify-reset-token/{invalid_token}")
        self.assertEqual(verify_resp.status_code, 400)
        self.assertFalse(verify_resp.get_json().get("valid"))

        reset_resp = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": invalid_token,
                "password": "NewValidPassword123!",
                "confirm_password": "NewValidPassword123!",
            },
        )
        self.assertEqual(reset_resp.status_code, 400)
        self.assertIn("invalid or has expired", reset_resp.get_json().get("message", ""))

    # --------------------------------------------------------------------------
    # 6. Reused token rejected with 400
    # --------------------------------------------------------------------------
    def test_06_reused_token_rejected(self):
        """A reset token cannot be used a second time after successful reset."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        # First use -> Should succeed
        first_resp = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "PasswordRound1_123!",
                "confirm_password": "PasswordRound1_123!",
            },
        )
        self.assertEqual(first_resp.status_code, 200)

        # Second use with same token -> Must fail
        second_resp = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "PasswordRound2_123!",
                "confirm_password": "PasswordRound2_123!",
            },
        )
        self.assertEqual(second_resp.status_code, 400)
        self.assertIn("invalid or has expired", second_resp.get_json().get("message", ""))

    # --------------------------------------------------------------------------
    # 7. Valid token resets password successfully
    # --------------------------------------------------------------------------
    def test_07_valid_token_resets_password_successfully(self):
        """Valid token successfully updates password and returns 200."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        response = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "BrandNewSecret2026!",
                "confirm_password": "BrandNewSecret2026!",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["message"], "Your password has been reset successfully.")

    # --------------------------------------------------------------------------
    # 8. Password mismatch rejected
    # --------------------------------------------------------------------------
    def test_08_password_mismatch_rejected(self):
        """Mismatched password and confirm_password are rejected with 400."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        response = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "FirstPassword123!",
                "confirm_password": "DifferentPassword123!",
            },
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data["status"], "error")
        self.assertIn("match", data["message"].lower())

    # --------------------------------------------------------------------------
    # 9. Weak password (<8 chars) rejected
    # --------------------------------------------------------------------------
    def test_09_weak_password_rejected(self):
        """Passwords under 8 characters are rejected with 400."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        response = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": "short",
                "confirm_password": "short",
            },
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data["status"], "error")
        self.assertIn("8 characters", data["message"])

    # --------------------------------------------------------------------------
    # 10. Successful reset changes password hash
    # --------------------------------------------------------------------------
    def test_10_successful_reset_changes_password_hash(self):
        """Password hash in DB changes after successful reset and matches new plain password."""
        old_hash = self.user.password_hash

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        new_plain_pass = "CompletelyNewSecurePass2026!"
        response = self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": new_plain_pass,
                "confirm_password": new_plain_pass,
            },
        )
        self.assertEqual(response.status_code, 200)

        db.session.refresh(self.user)
        self.assertNotEqual(self.user.password_hash, old_hash)
        self.assertTrue(check_password_hash(self.user.password_hash, new_plain_pass))
        self.assertFalse(check_password_hash(self.user.password_hash, self.initial_password))

    # --------------------------------------------------------------------------
    # 11. Login with new password succeeds
    # --------------------------------------------------------------------------
    def test_11_login_with_new_password_succeeds(self):
        """User can log in with new password after reset, receiving valid JWT."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        new_password = "MyNewSecretPassword2026!"
        self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": new_password,
                "confirm_password": new_password,
            },
        )

        login_resp = self.client.post(
            "/api/auth/login",
            json={
                "email": self.test_email,
                "password": new_password,
            },
        )
        self.assertEqual(login_resp.status_code, 200)
        login_data = login_resp.get_json()
        self.assertIn("token", login_data)
        self.assertEqual(login_data["user"]["email"], self.test_email)

    # --------------------------------------------------------------------------
    # 12. Old password fails authentication
    # --------------------------------------------------------------------------
    def test_12_old_password_fails_authentication(self):
        """Old password is permanently rejected with 401 after reset."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        new_password = "ReplacedPassword2026!"
        self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": new_password,
                "confirm_password": new_password,
            },
        )

        old_login_resp = self.client.post(
            "/api/auth/login",
            json={
                "email": self.test_email,
                "password": self.initial_password,
            },
        )
        self.assertEqual(old_login_resp.status_code, 401)
        self.assertIn("Invalid email or password", old_login_resp.get_json().get("message", ""))

    # --------------------------------------------------------------------------
    # 13. Token invalidated after use
    # --------------------------------------------------------------------------
    def test_13_token_invalidated_after_use(self):
        """Reset token hash and expiry are cleared to NULL immediately upon successful reset."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        self.user.reset_token_hash = token_hash
        self.user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.session.commit()

        new_pass = "AnotherSecurePassword2026!"
        self.client.post(
            "/api/auth/reset-password",
            json={
                "token": raw_token,
                "password": new_pass,
                "confirm_password": new_pass,
            },
        )

        db.session.refresh(self.user)
        self.assertIsNone(self.user.reset_token_hash)
        self.assertIsNone(self.user.reset_token_expires_at)


if __name__ == "__main__":
    unittest.main()
