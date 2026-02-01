# Change: Init Backend API & Core Modules

## Why
To transition Sportan from concept to a functional MVP, we need to establish the core backend architecture and implement the APIs defined in `docs/endpoints.md`. This foundation enables Coaches to manage groups/athletes, and allows tracking of training data.

## What Changes
- **Architecture Scaffolding:** Setup Modular Monolith structure (FastAPI, SQLAlchemy, Alembic).
- **Identity Module:** Implement User profiles for Coach, Athlete, Parent and auth middleware.
- **Coaching Module:** Implement logic for Groups, Membership, and Coach management of Athletes/Parents.
- **Training Module:** Implement Workouts logging and Assignment logic (pending -> completed/skipped).
- **AI Module:** Integrate Google Gemini API for Talent Recognition and Weekly Insights.
- **API Router:** Expose endpoints for `/coach`, `/athlete`, `/parent`, and `/workouts` as specified.

## Impact
- **New Capabilities:** Full backend support for the Sportan MVP feature set.
- **Database:** New schema creation for all core entities (users, groups, workouts, assignments, etc.).
- **External:** Integration with Supabase (Auth/DB) and Google Gemini.
