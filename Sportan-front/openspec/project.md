# Project Context

## Purpose
Sportan is a youth athletic development platform built with React Native and Expo. Its goal is to help coaches, athletes, and parents track training progress, stay organized, and identify athletic potential through a structured, data-driven ecosystem.

## Tech Stack
- **Framework:** React Native + Expo SDK 52+ (Managed Workflow)
- **Language:** TypeScript (Strict Mode)
- **Navigation:** Expo Router (File-based routing)
- **State Management:** Zustand (Local state) + TanStack Query (Server state/Caching)
- **Styling:** Custom Theme System (`@/lib/theme`) + StyleSheet
- **Animations:** React Native Reanimated
- **Assets/Fonts:** Expo Image, Expo Font (System fonts preferred)

## Project Conventions

### Code Style
- **Naming:**
  - Components: PascalCase (e.g., `MetricCard.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useTheme.ts`)
  - Utilities/Stores: camelCase (e.g., `queryClient.ts`, `authStore.ts`)
  - Types/Interfaces: PascalCase (e.g., `Athlete`, `ButtonProps`)
- **Structure:**
  - Import aliases used extensively (`@/components`, `@/lib`, etc.).
  - Functional components wrapped in `memo`.
  - Handlers wrapped in `useCallback`.
  - Styles defined with `StyleSheet.create`.
  - No inline styles or hardcoded colors; strictly use theme tokens.

### Architecture Patterns
- **Modular Component Design:**
  - `components/ui`: Reusable primitives (Button, Text, Card).
  - `components/coach`: Feature-specific domain components.
- **Data Flow:**
  - **Zustand:** Auth state, UI preferences.
  - **TanStack Query:** API data fetching and caching.
- **Navigation:** File-based routing in `app/` directory mirroring the URL structure.

### Testing Strategy
- Manual verification via Expo Go.
- Code quality enforced via TypeScript and Linting.

### Git Workflow
- Feature branches merged into `main`.
- OpenSpec workflow (`openspec/changes/`) for proposing and tracking significant architectural changes or new features.

## Domain Context
- **Roles:**
  - **Coach:** Manages groups, assigns workouts, views analytics.
  - **Athlete:** Views schedule, tracks workout history.
  - **Parent:** Monitors child's progress and assignments.
- **Core Entities:**
  - **Groups:** Collections of athletes (e.g., "Elite Sprinters").
  - **Workouts:** Training sessions (assigned or logged).
  - **Assessments:** Evaluation of movement skills.
  - **Talent Report:** AI-generated analysis of athlete potential.

## Important Constraints
- **Mobile First:** Designed for iOS and Android (Portrait mode).
- **Offline Capable:** Zustand persist is used for critical state.
- **Performance:**
  - Use `FlashList` or `FlatList` for lists (never `ScrollView` + `map`).
  - Heavy usage of `memo` and `useCallback` to prevent re-renders.

## External Dependencies
- **Backend:** Sportan Backend (FastAPI, Supabase).
- **Services:**
  - Google Gemini (AI Analysis).
  - Supabase Auth & Database (Integration target).