#!/usr/bin/env python3
"""
Integration test script for JWT verification with Supabase JWKS.

This script helps verify that the JWT refactor is working correctly
by testing the authentication flow with real Supabase tokens.

Usage:
    uv run python scripts/test_jwt_verification.py <your-jwt-token>
"""

import sys
from pathlib import Path

import jwt
import pytest
from jwt import PyJWKClient

# Add project root to path
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))


def load_settings():
    from app.core.config import settings as cfg

    return cfg


settings = load_settings()

pytestmark = pytest.mark.skip(
    reason="Manual integration script; run directly via `uv run python scripts/test_jwt_verification.py`."
)


def test_jwks_endpoint():
    """Test that JWKS endpoint is accessible and returns keys."""
    print("=" * 60)
    print("1. Testing JWKS Endpoint")
    print("=" * 60)
    print(f"JWKS URL: {settings.SUPABASE_JWKS_URL}\n")

    try:
        jwks_client = PyJWKClient(settings.SUPABASE_JWKS_URL)
        print("✓ JWKS client initialized successfully")
        return jwks_client
    except Exception as e:
        print(f"✗ Failed to initialize JWKS client: {e}")
        return None


def test_token_header(token: str):
    """Decode and display token header without verification."""
    print("\n" + "=" * 60)
    print("2. Token Header (Unverified)")
    print("=" * 60)

    try:
        header = jwt.get_unverified_header(token)
        print(f"Algorithm: {header.get('alg')}")
        print(f"Key ID: {header.get('kid')}")
        print(f"Type: {header.get('typ')}")
        return header
    except Exception as e:
        print(f"✗ Failed to decode token header: {e}")
        return None


def test_token_verification(jwks_client: PyJWKClient, token: str):
    """Verify token using JWKS."""
    print("\n" + "=" * 60)
    print("3. Token Verification")
    print("=" * 60)

    try:
        # Get signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        print(f"✓ Found signing key: {signing_key.key_id}")

        # Decode and verify token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            options={"verify_aud": False},
        )

        print("\n✓ Token verified successfully!")
        print("\nToken Payload:")
        print(f"  - User ID: {payload.get('sub')}")
        print(f"  - Email: {payload.get('email')}")
        print(f"  - Role: {payload.get('role')}")
        print(f"  - Issued At: {payload.get('iat')}")
        print(f"  - Expires At: {payload.get('exp')}")

        return payload

    except jwt.ExpiredSignatureError:
        print("✗ Token has expired")
        return None
    except jwt.InvalidSignatureError:
        print("✗ Invalid token signature")
        return None
    except Exception as e:
        print(f"✗ Verification failed: {e}")
        return None


def main():
    """Main test function."""
    print("\n" + "=" * 60)
    print("Supabase JWT Verification Test")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUsage: uv run python scripts/test_jwt_verification.py <jwt-token>")
        print("\nTo get a test token:")
        print("  1. Go to your Supabase Dashboard")
        print("  2. Authentication > Users")
        print("  3. Create a test user or login")
        print("  4. Copy the access_token from the response")
        sys.exit(1)

    token = sys.argv[1]

    # Test JWKS endpoint
    jwks_client = test_jwks_endpoint()
    if not jwks_client:
        sys.exit(1)

    # Test token header
    header = test_token_header(token)
    if not header:
        sys.exit(1)

    # Verify token
    payload = test_token_verification(jwks_client, token)
    if not payload:
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    print("=" * 60)
    print("\nYour JWT verification is working correctly with:")
    print(f"  - Algorithm: {header.get('alg')}")
    print(f"  - JWKS Endpoint: {settings.SUPABASE_JWKS_URL}")
    print("\n")


if __name__ == "__main__":
    main()
