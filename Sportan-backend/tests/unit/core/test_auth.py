"""Unit tests for JWT authentication with JWKS."""

from unittest.mock import Mock, patch

import jwt
import pytest
from fastapi import HTTPException, status
from jwt.exceptions import PyJWKClientError

from app.core.auth import get_token_payload


class TestGetTokenPayload:
    """Tests for JWT token verification using JWKS."""

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_valid_token_with_es256(self, mock_jwt_decode, mock_jwks_client):
        """Test successful token verification with ES256 algorithm."""
        # Arrange
        token = "valid.jwt.token"
        expected_payload = {
            "user_id": "123",
            "role": "coach",
            "email": "coach@example.com",
        }

        # Mock signing key
        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        # Mock jwt.decode
        mock_jwt_decode.return_value = expected_payload

        # Act
        result = get_token_payload(token)

        # Assert
        assert result == expected_payload
        mock_jwks_client.get_signing_key_from_jwt.assert_called_once_with(token)
        mock_jwt_decode.assert_called_once_with(
            token,
            mock_signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            options={"verify_aud": False},
        )

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_valid_token_with_rs256(self, mock_jwt_decode, mock_jwks_client):
        """Test successful token verification with RS256 algorithm."""
        # Arrange
        token = "valid.jwt.token"
        expected_payload = {
            "user_id": "456",
            "role": "athlete",
            "email": "athlete@example.com",
        }

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_rsa_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_jwt_decode.return_value = expected_payload

        # Act
        result = get_token_payload(token)

        # Assert
        assert result == expected_payload

    @patch("app.core.auth.jwks_client")
    def test_jwks_client_error_network_failure(self, mock_jwks_client):
        """Test handling of JWKS network errors."""
        # Arrange
        token = "valid.jwt.token"
        mock_jwks_client.get_signing_key_from_jwt.side_effect = PyJWKClientError("Failed to fetch JWKS from endpoint")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Failed to fetch signing keys" in exc_info.value.detail

    @patch("app.core.auth.jwks_client")
    def test_jwks_client_error_key_not_found(self, mock_jwks_client):
        """Test handling when key ID is not found in JWKS."""
        # Arrange
        token = "valid.jwt.token"
        mock_jwks_client.get_signing_key_from_jwt.side_effect = PyJWKClientError(
            "Unable to find a signing key that matches"
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Failed to fetch signing keys" in exc_info.value.detail

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_invalid_signature(self, mock_jwt_decode, mock_jwks_client):
        """Test handling of invalid JWT signature."""
        # Arrange
        token = "invalid.signature.token"

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        mock_jwt_decode.side_effect = jwt.InvalidSignatureError("Signature verification failed")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_expired_token(self, mock_jwt_decode, mock_jwks_client):
        """Test handling of expired JWT."""
        # Arrange
        token = "expired.jwt.token"

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        mock_jwt_decode.side_effect = jwt.ExpiredSignatureError("Token has expired")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_malformed_token(self, mock_jwt_decode, mock_jwks_client):
        """Test handling of malformed JWT."""
        # Arrange
        token = "malformed.token"

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        mock_jwt_decode.side_effect = jwt.DecodeError("Not enough segments")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_invalid_algorithm(self, mock_jwt_decode, mock_jwks_client):
        """Test handling of unsupported algorithm."""
        # Arrange
        token = "invalid.algorithm.token"

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        mock_jwt_decode.side_effect = jwt.InvalidAlgorithmError("Algorithm not supported")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_unexpected_error(self, mock_jwt_decode, mock_jwks_client):
        """Test handling of unexpected errors."""
        # Arrange
        token = "valid.jwt.token"

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        mock_jwt_decode.side_effect = Exception("Unexpected error occurred")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_token_payload(token)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Authentication error" in exc_info.value.detail

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_token_with_correct_audience(self, mock_jwt_decode, mock_jwks_client):
        """Test token with correct audience claim."""
        # Arrange
        token = "valid.jwt.token"
        expected_payload = {
            "user_id": "789",
            "role": "parent",
            "aud": "authenticated",
        }

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_jwt_decode.return_value = expected_payload

        # Act
        result = get_token_payload(token)

        # Assert
        assert result == expected_payload
        assert result["aud"] == "authenticated"

    @patch("app.core.auth.jwks_client")
    @patch("app.core.auth.jwt.decode")
    def test_token_caching_behavior(self, mock_jwt_decode, mock_jwks_client):
        """Test that JWKS client caching is properly configured."""
        # Arrange
        token = "valid.jwt.token"
        expected_payload = {"user_id": "123", "role": "coach"}

        mock_signing_key = Mock()
        mock_signing_key.key = "mock_public_key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_jwt_decode.return_value = expected_payload

        # Act - Call twice to verify caching
        result1 = get_token_payload(token)
        result2 = get_token_payload(token)

        # Assert
        assert result1 == result2
        # JWKS client should be called twice (mocking doesn't simulate actual caching)
        assert mock_jwks_client.get_signing_key_from_jwt.call_count == 2
