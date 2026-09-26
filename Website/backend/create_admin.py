#!/usr/bin/env python3
"""
Admin Account Provisioning Script
Step 16: Admin Authentication Foundation

Usage:
    Interactive mode:
        python create_admin.py

    Non-interactive / Scripted mode:
        python create_admin.py --name "Admin Name" --email "admin@example.com" --password "SecurePassword123"
"""
import argparse
import getpass
import os
import sys

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User
from app.services.auth_service import EMAIL_REGEX


def validate_admin_inputs(name, email, password):
    """Validate admin user input fields."""
    if not name or len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long."

    if not email or not EMAIL_REGEX.match(email.strip().lower()):
        return False, "Please provide a valid email address."

    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."

    return True, None


def main():
    parser = argparse.ArgumentParser(description="Create or promote an administrator account.")
    parser.add_argument("--name", help="Full name of administrator", default=None)
    parser.add_argument("--email", help="Administrator email address", default=None)
    parser.add_argument("--password", help="Administrator password", default=None)
    args = parser.parse_args()

    name = args.name
    email = args.email
    password = args.password

    # Interactive input if arguments were not provided
    if not email:
        try:
            print("=== Portfolio Administrator Provisioning ===")
            if not name:
                name = input("Enter Admin Name: ").strip()
            email = input("Enter Admin Email: ").strip()
            if not password:
                password = getpass.getpass("Enter Admin Password (min 8 chars): ")
                confirm_password = getpass.getpass("Confirm Admin Password: ")
                if password != confirm_password:
                    print("\n[ERROR] Passwords do not match.", file=sys.stderr)
                    sys.exit(1)
        except (KeyboardInterrupt, EOFError):
            print("\nOperation cancelled.")
            sys.exit(1)

    name = (name or "Administrator").strip()
    email = (email or "").strip().lower()

    # Validate inputs
    is_valid, error = validate_admin_inputs(name, email, password)
    if not is_valid:
        print(f"\n[ERROR] {error}", file=sys.stderr)
        sys.exit(1)

    app = create_app()
    with app.app_context():
        try:
            # Check if user already exists
            user = User.query.filter_by(email=email).first()

            if user:
                # Update existing user to admin
                user.name = name
                user.role = "admin"
                user.is_active = True
                user.password_hash = generate_password_hash(password)
                db.session.commit()
                print(f"[SUCCESS] User '{email}' has been updated to role 'admin'.")
            else:
                # Create brand new admin user
                new_admin = User(
                    name=name,
                    email=email,
                    password_hash=generate_password_hash(password),
                    role="admin",
                    is_active=True,
                )
                db.session.add(new_admin)
                db.session.commit()
                print(f"[SUCCESS] Admin user created successfully: {email}")

        except Exception as e:
            db.session.rollback()
            print(f"\n[ERROR] Database operation failed: {type(e).__name__} - {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
