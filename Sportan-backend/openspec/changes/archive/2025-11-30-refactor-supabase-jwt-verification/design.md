## Context
**Migration Complete:** The Sportan backend has successfully transitioned from Supabase's legacy JWT Secret (symmetric HS256) to asymmetric JWT verification using JWKS (ES256/RS256). The deprecated `SUPABASE_JWT_SECRET` has been removed from the codebase, and all JWT verification now happens via dynamic public key fetching from Supabase's JWKS endpoint.

## Goals / Non-Goals
- **Goals:**
    - Transition the backend's JWT verification mechanism from symmetric (HS256) to asymmetric (ES256).
    - Implement dynamic fetching and caching of Supabase's public signing keys via its JSON Web Key Set (JWKS) endpoint.
    - Enhance the security posture of the application's authentication.
    - Align with Supabase's recommended best practices for JWT handling.
- **Non-Goals:**
    - Modifying how JWTs are *issued* by Supabase Auth (this is managed by Supabase).
    - Implementing custom JWT generation within the backend (tokens are issued by Supabase).
    - Changing the core authentication flow (e.g., login/logout mechanisms).

## Decisions (Implemented)
- **Algorithm Choice (ES256/RS256):** Supporting both ES256 and RS256 algorithms for maximum flexibility with Supabase's asymmetric keys.
- **JWKS Fetching:** Implemented fetching from `https://<project-id>.supabase.co/auth/v1/.well-known/jwks.json`.
- **JWKS Caching:** Using PyJWT's built-in `PyJWKClient` with 5-minute cache (300 seconds), caching up to 16 keys.
- **Verification Library:** Migrated from `python-jose` to `pyjwt[crypto]` for better JWKS support and built-in caching.
- **Error Handling:** Implemented specific exception handling for JWKS network failures, invalid signatures, expired tokens, and unexpected errors.

## Risks / Trade-offs
- **Breaking Change:** The transition requires careful coordination. If the Supabase project's signing key is rotated to asymmetric before the backend is updated, authentication will break.
- **Performance Impact:** Initial JWKS fetching adds a slight overhead. Caching mitigates this, but stale caches could temporarily cause verification failures during a key rotation if not handled gracefully.
- **Complexity:** Implementing JWKS fetching and caching adds complexity compared to a static shared secret.
- **Key Revocation Latency:** While Supabase products have instantaneous revocation, custom backend components (due to caching) might trust revoked keys for a short period (up to cache duration). Mitigation strategies (e.g., forced cache refresh on critical security events) should be considered for future enhancements.

## Migration Plan (Completed)
1.  ✅ **Backend Update:** Implemented JWKS fetching, caching, and ES256/RS256 verification in `app/core/auth.py`.
2.  ✅ **Library Migration:** Replaced `python-jose` with `pyjwt[crypto]` for better JWKS support.
3.  ✅ **Supabase Key Rotation:** Supabase automatically rotated to ECC (P-256) asymmetric key.
4.  ✅ **Configuration Update:** Added `SUPABASE_JWKS_URL` and removed deprecated `SUPABASE_JWT_SECRET`.
5.  ✅ **Unit Tests:** Created comprehensive test suite (11 tests) covering all verification scenarios.
6.  ⏳ **Integration Testing:** Test with real Supabase tokens (pending).
7.  ⏳ **Production Deployment:** Deploy and monitor (pending).

## Resolved Questions
- ✅ **Cache invalidation strategy:** Using PyJWT's `PyJWKClient` with 5-minute TTL and automatic key refresh.
- ✅ **JWKS URL configuration:** Configured directly via `SUPABASE_JWKS_URL` environment variable for explicit control.
- ✅ **Legacy token support:** Removed - all authentication now requires asymmetric ES256/RS256 tokens from Supabase JWKS.
