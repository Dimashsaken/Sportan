import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientError

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # TokenUrl is just for Swagger UI hint
logger = logging.getLogger(__name__)

# Initialize JWKS client with caching enabled
# Caches up to 16 keys with 5-minute lifespan
jwks_client = PyJWKClient(
    uri=settings.SUPABASE_JWKS_URL,
    cache_keys=True,
    max_cached_keys=16,
    cache_jwk_set=True,
    lifespan=300,  # 5 minutes cache
    timeout=30,  # 30 seconds timeout for fetching JWKS
)


def get_token_payload(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    """
    Verify and decode JWT using Supabase's JWKS endpoint.
    Supports asymmetric algorithms (ES256, RS256, etc.).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Fetch the signing key from JWKS using the token's 'kid' header
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the JWT using the fetched public key
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],  # Support both ES256 and RS256
            audience="authenticated",  # Standard Supabase audience
            options={"verify_aud": False},  # Flexible audience check
        )
        return payload

    except PyJWKClientError as e:
        logger.warning("JWKS fetch failed: %s", e)
        # JWKS-specific errors (network issues, invalid JWKS, key not found)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to fetch signing keys: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    except InvalidTokenError as e:
        logger.info("Invalid token: %s", e)
        # JWT verification errors (invalid signature, expired, malformed)
        raise credentials_exception from e

    except Exception as e:
        logger.error("Unexpected auth error (%s): %s", type(e).__name__, e)
        # Catch-all for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}",
        ) from e
