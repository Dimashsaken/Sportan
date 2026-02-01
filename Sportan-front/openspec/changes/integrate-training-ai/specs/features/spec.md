## ADDED Requirements

### Requirement: Workout Management
The frontend SHALL allow coaches to assign and track workouts via the API.

#### Scenario: Assign Workout
- **WHEN** Coach submits the "Assign Workout" form
- **THEN** call `POST /coach/.../assigned-workouts`
- **AND** invalidate "assigned-workouts" query

#### Scenario: View Schedule
- **WHEN** viewing an Athlete profile
- **THEN** fetch and display items from `GET /coach/athletes/{id}/assigned-workouts`

### Requirement: AI Reporting
The frontend SHALL interface with the backend AI module.

#### Scenario: View Report
- **WHEN** opening the Talent Report screen
- **THEN** fetch the latest report from `GET /coach/.../ai/talent-recognition`
- **IF** no report exists, show "Generate Report" button which calls `POST` endpoint
