# Change: Refactor Supabase JWT Verification to Asymmetric (ES256)

## Why
The current backend implementation uses symmetric (HS256) JWT verification with a shared secret, which is a legacy approach. Supabase's dashboard and documentation indicate a strong recommendation for asymmetric (e.g., ES256) signing keys and dynamic public key fetching via a JWKS (JSON Web Key Set) endpoint. This change enhances security, improves key rotation capabilities, and aligns with modern best practices for JWT authentication.

## What Changes
- **Configuration Update:** Add Supabase JWKS URL to application settings.
- **Auth Middleware Refactor:** Modify `app/core/auth.py` to:
    - Dynamically fetch and cache public keys from the Supabase JWKS endpoint.
    - Update JWT decoding logic to use the appropriate asymmetric algorithm (ES256) and the fetched public keys for verification.
- **Supabase Dashboard Configuration:** Requires manual configuration in the Supabase dashboard to rotate the current JWT signing key to an asymmetric (ECC P-256) key.

## Impact
- **Security:** Improved security posture by moving from a shared secret to public/private key cryptography for JWT verification.
- **Maintainability:** Easier key rotation without application redeployment.
- **Codebase:** Direct impact on `app/core/auth.py` and `app/core/config.py`. Indirect impact on any part of the application relying on `get_token_payload` if the return type or behavior changes subtly (though this change aims to maintain the existing interface).
- **Deployment:** Requires careful coordination with Supabase dashboard changes to ensure seamless transition during key rotation.
