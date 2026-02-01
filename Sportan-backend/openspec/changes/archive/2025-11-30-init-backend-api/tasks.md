## 1. Project Setup
- [x] 1.1 Initialize FastAPI project structure (Modular Monolith).
- [x] 1.2 Configure dependency management (uv init).
- [x] 1.3 Setup Ruff (linter) and Alembic (migrations).
- [x] 1.4 Implement `core` module:
    - Database connection (SQLAlchemy AsyncSession).
    - Supabase Auth middleware (JWT verification).
    - Configuration loading (pydantic-settings).
- [x] 1.5 Configure Alembic `env.py`:
    - Set `target_metadata`.
    - Use `settings.DATABASE_URL`.

## 2. Identity Module
- [x] 2.1 Define Models: `User` (base?), `Coach`, `Athlete`, `Parent`.
- [x] 2.2 Define Schemas: Profile responses.
- [x] 2.3 Implement Service: `get_current_user`, profile retrieval.
- [x] 2.4 Implement Endpoints:
    - `GET /coach/me`
    - `GET /athlete/me`
    - `GET /parent/me`

## 3. Coaching Module
- [x] 3.1 Define Models: `Group`, `GroupAthlete`.
- [x] 3.2 Implement Service:
    - Group CRUD (create, list, update, delete with cascade).
    - Membership management (add/remove athlete).
    - Coach-managed Athlete CRUD (create, update, delete).
    - Coach-managed Parent CRUD.
- [x] 3.3 Implement Endpoints:
    - `/coach/groups` (CRUD)
    - `/coach/groups/{id}/athletes` (Membership)
    - `/coach/athletes/{id}` (Management)
    - `/coach/parents` (Management)

## 4. Training Module
- [x] 4.1 Define Models: `Workout`, `AssignedWorkout`.
- [x] 4.2 Implement Service:
    - Assignment creation (Group-wide & Individual).
    - Workout logging (linking to assignment if applicable).
    - Status updates (`pending` -> `completed`).
    - Scheduled job (or logic) for `skipped` status.
- [x] 4.3 Implement Endpoints:
    - `/coach/assigned-workouts` & `/coach/groups/{id}/assigned-workouts`
    - `/workouts` (CRUD - Log workout)
    - `/athlete/me/workouts` & `/athlete/me/assigned-workouts`
    - `/parent/athlete/workouts` & `/parent/athlete/assigned-workouts`

## 5. AI Module
- [x] 5.1 Integrate `google-generativeai` SDK.
- [x] 5.2 Implement Service:
    - `generate_talent_report(athlete_data)`
    - `generate_weekly_insights(workout_history)`
- [x] 5.3 Implement Endpoints:
    - `/coach/athletes/{id}/ai/...`
    - `/parent/athlete/ai/...`

## 6. Verification
- [x] 6.1 Verify all endpoints against `docs/endpoints.md`.
- [x] 6.2 Run linter (Ruff).
