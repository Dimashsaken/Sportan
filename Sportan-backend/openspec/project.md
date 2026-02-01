# Project Context

## Purpose
Sportan is a youth athletic development platform designed to facilitate structured training, tracking, and talent identification. It connects **Coaches** (organizers), **Athletes** (participants), and **Parents** (observers) in a safe, ethical ecosystem. The goal is to move away from spreadsheet chaos to a streamlined app that provides clarity on training volume, progress, and potential without pressuring young athletes.

## Tech Stack
- **Language:** Python (3.12)
- **Manager:** uv (for dependency management)
- **Framework:** FastAPI
- **Database:** PostgreSQL (via Supabase)
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Auth:** Supabase Auth

## Project Conventions

### Code Style
- **Naming:** `snake_case` for functions and variables; `PascalCase` for classes.
- **Linting:** Ruff (for linting and formatting).
- **Type Hinting:** Strong typing required (Pydantic models, standard `typing`).

### Architecture Patterns
- **Modular Monolith:** Application structure is organized by **domain modules** (Vertical Slicing) rather than technical layers.
- **Module Structure:** Each domain (e.g., `coaching`, `training`, `ai`) serves as a self-contained module containing its own:
    - `models.py` (Database entities)
    - `schemas.py` (Pydantic DTOs)
    - `service.py` (Business logic)
    - `router.py` (API endpoints)
- **Shared Core:** Cross-cutting concerns (Database connection, Config, Auth middleware, Base models) reside in a `core` or `shared` module.
- **API Design:** RESTful API (as defined in `docs/endpoints.md`).
- **Security:** Role-Based Access Control (RBAC) enforced via Supabase JWTs (`coach`, `parent`, `athlete`).

## Domain Context
### Core Entities
- **Coach:** The primary actor. Manages groups, athletes, and parents. Runs AI tools.
- **Athlete:** The trainee. View-only access to their schedule.
- **Parent:** The guardian. View-only access to their child's data.
- **Assigned Workout:** A planned task (Status: `pending` -> `completed` -> `skipped`).
- **Workout Log:** The actual record of training. Can fulfill an Assigned Workout.

### Key Business Rules
1. **No Floating Athletes:** Athletes must always belong to at least one group.
2. **Assignment Logic:** If an assigned workout isn't completed by the day after its schedule, a backend job marks it `skipped`.
3. **Privacy:** Parents see only their child's data. Athletes see only their own.

## Important Constraints
- **Auth:** Must use Supabase Auth JWTs.
- **Permissions:** 
    - `coach` can write/delete.
    - `athlete`/`parent` are strictly read-only (except maybe profile updates if specified).
- **Deletions:**
    - Deleting a Group warns heavily and deletes athletes *only* if they belong to no other groups.
    - Deleting an Athlete cascades to their workouts, assignments, and parent links.

## External Dependencies
- **Supabase:** Authentication and Database hosting.
- **AI Service:** Google Gemini API (via `Google Gen AI` SDK) for "Talent Recognition" and "Weekly Insights".