## 1. Foundation
- [x] 1.1 Install dependencies (`axios`, `@supabase/supabase-js`).
- [x] 1.2 Create `lib/config.ts` to export `API_URL` and `SUPABASE_` keys from environment variables.
- [x] 1.3 Initialize Supabase client in `lib/supabase.ts`.
- [x] 1.4 Create `lib/api.ts` with an Axios instance and request interceptor that injects the Supabase JWT.

## 2. Authentication Integration
- [x] 2.1 Update `store/authStore.ts` to use `lib/supabase.ts` for `login` and `logout` actions instead of mocks.
- [x] 2.2 Implement session persistence and restoration in `authStore`.
- [x] 2.3 Verify `lib/api.ts` correctly picks up the token after login.

## 3. Data Layer Migration
- [x] 3.1 Refactor `fetchDashboardData` in `data/api.ts` (create if needed, separate from mockData) to hit `GET /coach/dashboard` (or equivalent aggregate).
- [x] 3.2 Refactor `fetchGroups` and `fetchGroupById` to hit `/coach/groups`.
- [x] 3.3 Refactor `fetchAthletes` endpoints to hit `/coach/athletes`.
- [x] 3.4 Refactor `Workout` related functions (assign, log) to hit `/training/*` endpoints.

## 4. Verification
- [x] 4.1 Verify Login flow with real Supabase credentials.
- [x] 4.2 Verify Coach Dashboard loads data from backend.
- [x] 4.3 Verify Error handling (e.g., kill backend and check app behavior).
