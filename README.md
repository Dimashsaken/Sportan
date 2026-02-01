# Sportan - Youth Athletic Development Platform

A comprehensive platform designed to help coaches, young athletes, and parents track training progress, stay organized, and identify athletic potential early through AI-powered insights.

## 🎯 Overview

Sportan is a youth athletic development platform that creates a **simple but powerful ecosystem** focused on clarity, structure, and long-term development—not performance pressure. The platform helps children grow, supports coaches' workflow, and gives parents transparency, all while offering an ethical, responsible approach to early-stage talent recognition.

### Main Objectives

1. **Organize coaching workflow** - Provide coaches with a clean interface to manage multiple groups, athletes, parents, and training plans
2. **Track and measure progress** - Give athletes and parents visibility into workouts, assignments, and improvements over time
3. **Support better training decisions** - Generate clear summaries and statistics for each athlete based on real activity
4. **Offer early talent discovery** - Provide AI-powered insights to help coaches identify potential strengths without labeling or pressuring kids
5. **Enable clear communication** - Parents see exactly what the athlete is asked to do and how they are progressing

## ✨ Key Features

### For Coaches
- **Group Management**: Create and manage multiple training groups (teams/squads/classes)
- **Athlete Management**: Add athletes directly into groups with support for multiple group memberships
- **Workout Planning**: Create and assign workouts to entire groups or individual athletes
- **Progress Tracking**: View athlete summaries including workouts, training volume, and recent activities
- **Workout Verification**: Log workouts and mark assigned workouts as completed
- **Parent Management**: Create, update, and delete parent accounts
- **AI-Powered Insights**:
  - Talent recognition analysis
  - Weekly training insights
  - Performance pattern identification

### For Athletes
- View personal profile and training data
- Access assigned workouts (pending, completed, skipped)
- Review workout history logged by coaches
- Belong to one or multiple training groups
- Track personal development over time

### For Parents
- View their own profile and linked child information
- Access their child's athlete profile and statistics
- Review all workouts logged by the coach
- Monitor assigned workouts and their statuses
- View AI-generated reports:
  - Talent recognition insights
  - Weekly training analysis

## 📁 Project Structure

```
Sportan/
├── Sportan-backend/          # FastAPI backend server
│   ├── app/
│   │   ├── core/            # Core functionality (auth, config, database)
│   │   └── modules/         # Feature modules
│   │       ├── ai/          # AI-powered analysis
│   │       ├── coaching/    # Coach management
│   │       ├── identity/    # User authentication & profiles
│   │       └── training/    # Workout & training management
│   ├── alembic/             # Database migrations
│   ├── docs/                # API documentation
│   ├── scripts/             # Utility scripts
│   └── tests/               # Unit tests
│
└── Sportan-front/           # React Native mobile app
    ├── app/                 # App screens & navigation
    │   ├── (tabs)/         # Tab-based navigation
    │   ├── auth/           # Authentication screens
    │   ├── coach/          # Coach-specific screens
    │   └── assessment/     # Assessment screens
    ├── components/         # Reusable UI components
    ├── hooks/              # Custom React hooks
    ├── lib/                # Core utilities & configuration
    ├── store/              # State management (Zustand)
    └── types/              # TypeScript type definitions
```

## 🛠 Technology Stack

### Backend (Sportan-backend)
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: Supabase Auth with JWT
- **AI Integration**: OpenAI API
- **Async Support**: asyncpg
- **Container**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt via Certbot

### Frontend (Sportan-front)
- **Framework**: React Native with Expo (~54.0)
- **Language**: TypeScript
- **Navigation**: Expo Router (v6)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom component library
- **Charts**: Victory Native
- **Styling**: React Native Reanimated & Gesture Handler
- **Storage**: AsyncStorage & Expo Secure Store
- **Backend Client**: Axios with Supabase JS

## 🚀 Getting Started

### Prerequisites

- **Backend**: Python 3.12+, Docker, PostgreSQL
- **Frontend**: Node.js 18+, npm/yarn, Expo CLI
- **Development**: Git, VS Code (recommended)

### Backend Setup

```bash
cd Sportan-backend

# Install dependencies
pip install -e .

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload

# Or use Docker
docker-compose up
```

### Frontend Setup

```bash
cd Sportan-front

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## 🏗 Architecture

### Backend Architecture

The backend follows a modular architecture with clear separation of concerns:

```
FastAPI Application
├── Core Layer
│   ├── Authentication (JWT validation)
│   ├── Database (SQLAlchemy setup)
│   ├── Configuration (Pydantic settings)
│   └── Supabase integration
│
└── Module Layer
    ├── Identity Module (users, profiles, roles)
    ├── Coaching Module (groups, assignments)
    ├── Training Module (workouts, logs)
    └── AI Module (analysis, insights)
```

**Key Design Patterns:**
- **Dependency Injection**: FastAPI's DI system for database sessions and auth
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Router-based modules**: Each module has its own router

### Frontend Architecture

The frontend uses a component-based architecture with type-safe state management:

```
React Native App
├── Presentation Layer
│   ├── Screens (app/)
│   ├── Components (components/)
│   └── Navigation (expo-router)
│
├── Business Logic Layer
│   ├── API Client (lib/api.ts)
│   ├── State Management (store/)
│   └── Custom Hooks (hooks/)
│
└── Data Layer
    ├── React Query (caching & fetching)
    └── Supabase Client (auth & real-time)
```

## 🎓 Core Concepts

### Assigned Workouts Logic

Assigned workouts help coaches plan structured training sessions:

1. **Creation**: Coach assigns workout to a group or individual athlete
2. **Status Flow**:
   - `pending` → Default state when created
   - `completed` → Coach logs workout or manually marks complete
   - `skipped` → Automatically set if day passes without completion
3. **Verification**: Only coaches can mark workouts as completed
4. **Tracking**: Athletes and parents can view status in real-time

### Group & Athlete Management

- Athletes **must** belong to at least one group (no floating athletes)
- Athletes can belong to **multiple groups** simultaneously
- Deleting a group with an athlete's only membership cascades to delete the athlete
- Strong warnings shown in UI for destructive operations

### Permission Model

Based on JWT roles (`coach`, `parent`, `athlete`):

- **Coach**: Full access to their groups, athletes, and workouts
- **Parent**: Read-only access to their linked child's data
- **Athlete**: Read-only access to their own data
- All permissions enforced at API level with `coach_id`, `parent.athlete_id`, and `athlete.user_id` checks

## 👥 User Roles

### Coach
Primary user who manages the entire training ecosystem. Can create groups, add athletes, assign workouts, log training sessions, and generate AI insights.

### Athlete  
Young athlete who views their assigned workouts, training history, and development progress. Cannot manually log workouts (coach-verified only).

### Parent
Guardian who monitors their child's training activities, views progress reports, and accesses AI-generated talent insights for transparency.

## 💻 Development

### Backend Development

```bash
# Run tests
pytest

# Linting & formatting
ruff check .
ruff format .

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Frontend Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Clear cache
npx expo start -c
```

### Useful Scripts

Backend utility scripts in `/scripts`:
- `get_test_token.py` - Generate test JWT tokens
- `manual_athlete_tests.py` - Test athlete workflows
- `manual_coach_tests.py` - Test coach workflows
- `manual_parent_tests.py` - Test parent workflows
- `setup_test_coach.py` - Set up test data

## 📚 API Documentation

### Authentication
All API requests require JWT authentication via Supabase Auth:
```
Authorization: Bearer <jwt_token>
```

### Main Endpoints

**Identity** (`/identity`)
- User registration and profile management
- Role-based access control

**Coaching** (`/coach`)
- Group CRUD operations
- Athlete management
- Group-athlete membership

**Training** (`/training`)
- Workout logging and assignment
- Training history
- Status updates

**AI** (`/ai`)
- Talent recognition analysis
- Weekly insights generation
- Performance predictions

Full API documentation available in [docs/endpoints.md](Sportan-backend/docs/endpoints.md)

## 🔒 Security

- JWT-based authentication via Supabase
- Role-based access control (RBAC)
- Row-level security through coach/athlete relationships
- HTTPS/TLS encryption via Let's Encrypt
- Secure credential storage in Expo Secure Store
- CORS protection with whitelist

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For contribution guidelines, please contact the project maintainers.

## 📞 Support

For support and questions, please refer to the internal documentation or contact the development team.

---

**Built with ❤️ for young athletes, dedicated coaches, and supportive parents**
