## ADDED Requirements

### Requirement: Workout Assignments
Coaches SHALL be able to assign workouts to groups or individual athletes.

#### Scenario: Assign to Group
- **WHEN** Coach assigns workout to "Group A"
- **THEN** an `AssignedWorkout` is created for every athlete in Group A with status `pending`

#### Scenario: Assign to Individual
- **WHEN** Coach assigns workout to Athlete "Bob"
- **THEN** an `AssignedWorkout` is created for Bob

### Requirement: Workout Logging
Coaches SHALL be able to log completed workouts for athletes.

#### Scenario: Log Ad-hoc Workout
- **WHEN** Coach logs a workout for "Bob"
- **THEN** a `Workout` record is saved

#### Scenario: Log Assigned Workout
- **WHEN** Coach logs a workout linked to `assigned_workout_id`
- **THEN** the `Workout` is saved
- **AND** the `AssignedWorkout` status updates to `completed`

### Requirement: Assignment Status
The system SHALL track the status of assigned workouts.

#### Scenario: Manual Completion
- **WHEN** Coach manually updates an assignment to `completed`
- **THEN** the status changes without a full workout log

#### Scenario: Auto-Skip
- **WHEN** the scheduled date has passed without completion
- **THEN** the system marks the assignment as `skipped`
