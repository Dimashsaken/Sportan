#!/usr/bin/env python3
"""
Get access token for test user from Supabase.
"""

import sys
from pathlib import Path

from supabase import create_client


def load_settings():
    project_root = Path(__file__).parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    from app.core.config import settings as cfg

    return cfg


settings = load_settings()

# Test user credentials
TEST_EMAIL = "askhat.ss23+test@gmail.com"
TEST_PASSWORD = "TestPass"


def get_access_token():
    """Sign in and get access token."""
    print("=" * 60)
    print("Getting Access Token from Supabase")
    print("=" * 60)
    print(f"Email: {TEST_EMAIL}")
    print(f"Supabase URL: {settings.SUPABASE_URL}\n")

    try:
        # Create Supabase client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

        # Sign in
        print("Signing in...")
        response = supabase.auth.sign_in_with_password({"email": TEST_EMAIL, "password": TEST_PASSWORD})

        if response.session:
            print("[OK] Sign-in successful!\n")
            print("=" * 60)
            print("Access Token:")
            print("=" * 60)
            print(response.session.access_token)
            print("\n" + "=" * 60)
            print("User Info:")
            print("=" * 60)
            print(f"User ID: {response.user.id}")
            print(f"Email: {response.user.email}")
            print(f"Role: {response.user.role}")
            print("\n" + "=" * 60)
            print("Token Header (unverified):")
            print("=" * 60)

            # Decode header to show algorithm
            import jwt

            header = jwt.get_unverified_header(response.session.access_token)
            print(f"Algorithm: {header.get('alg')}")
            print(f"Key ID: {header.get('kid')}")
            print(f"Type: {header.get('typ')}")

            return response.session.access_token
        else:
            print("[ERROR] No session returned")
            return None

    except Exception as e:
        print(f"[ERROR] {e}")
        return None


if __name__ == "__main__":
    token = get_access_token()
    if not token:
        sys.exit(1)
