# Change: Connect Frontend to Backend API

## Why
The application currently operates on local mock data (`data/mockData.ts`). To transition to a functional MVP, the frontend must connect to the live `sportan-backend` services for Authentication, Data Persistence, and AI features.

## What Changes
- **Network Layer:** Implement a centralized HTTP client (`axios`) with Supabase Auth token interception.
- **Configuration:** Introduce environment variable management for API URLs.
- **Data Access:** Refactor data fetching functions to consume real backend endpoints instead of mocks.
- **Authentication:** Update `authStore` to manage real Supabase sessions and JWTs.

## Impact
- **Modified:** `store/authStore.ts`, `data/mockData.ts` (deprecated/replaced).
- **Added:** `lib/api.ts`, `lib/config.ts`.
- **Affected Specs:** `connectivity`.
