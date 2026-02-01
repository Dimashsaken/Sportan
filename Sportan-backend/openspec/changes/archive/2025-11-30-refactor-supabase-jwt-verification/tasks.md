## 1. Backend Implementation
- [x] 1.1 Update `app/core/config.py` to include `SUPABASE_JWKS_URL`.
- [x] 1.2 Implement JWKS fetching and caching mechanism in `app/core/auth.py`.
- [x] 1.3 Modify JWT verification logic in `app/core/auth.py` to use fetched JWKS and `ES256` algorithm.
- [x] 1.4 Update `app/core/auth.py` error handling for JWKS-related issues.
- [x] 1.5 Add unit tests for the updated JWT verification logic.

## 2. Supabase Configuration (Manual)
- [x] 2.1 Rotate the JWT signing key in the Supabase dashboard to use an asymmetric key (e.g., ECC P-256).
- [x] 2.2 Verify that new JWTs issued by Supabase Auth are signed with the asymmetric key.

## 3. Verification
- [x] 3.1 Test authentication flows thoroughly with tokens signed by the new asymmetric key.
- [x] 3.2 Verify existing API endpoints function correctly with the updated authentication.
- [x] 3.3 Perform a security review of the JWT verification implementation.
