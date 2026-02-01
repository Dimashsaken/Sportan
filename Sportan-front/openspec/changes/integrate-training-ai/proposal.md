# Change: Integrate Training & AI Modules

## Why
The frontend currently only connects to the Coaching module (Groups/Athletes). To achieve MVP status, we must integrate the core value-add features: Workout Planning (Training Module) and Talent Analysis (AI Module). Without these, the app is just a roster manager.

## What Changes
- **Training Integration:**
  - Connect "Assign Workout" flows to `POST /coach/.../assigned-workouts`.
  - Connect "Workout Detail" views to fetch assignments.
  - Implement `POST /workouts` to log completed sessions.
  - Display real workout history on Athlete/Coach dashboards.
- **AI Integration:**
  - Connect "Talent Report" screen to `GET/POST /coach/athletes/{id}/ai/talent-recognition`.
  - Connect "Weekly Insights" to `GET/POST /coach/athletes/{id}/ai/weekly-insights`.
- **UI Updates:**
  - Replace static/placeholder charts with data-driven visualizations based on real AI/Workout responses.

## Impact
- **Modified:** `data/mockData.ts` (add training/AI endpoints), `app/coach/assign-workout.tsx`, `app/coach/talent-report/[athleteId].tsx`.
- **Affected Specs:** `training`, `ai`.
