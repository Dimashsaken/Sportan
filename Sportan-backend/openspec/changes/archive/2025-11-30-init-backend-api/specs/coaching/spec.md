## ADDED Requirements

### Requirement: Group Management
Coaches SHALL be able to create, view, update, and delete training groups.

#### Scenario: Create Group
- **WHEN** Coach submits name "U12 Squad" and description
- **THEN** a new Group is created linked to the Coach

#### Scenario: Delete Group Cascade
- **WHEN** Coach deletes a Group
- **THEN** the Group and all memberships are removed
- **AND** Athletes belonging ONLY to this group are deleted (with warning)

### Requirement: Group Membership
Coaches SHALL be able to add and remove athletes from groups.

#### Scenario: Add New Athlete
- **WHEN** Coach adds a new athlete "Alice" to Group A
- **THEN** Athlete profile is created and linked to Group A

#### Scenario: Add Existing Athlete
- **WHEN** Coach adds existing athlete "Alice" (already in Group A) to Group B
- **THEN** Alice is linked to Group B (multi-group membership)

#### Scenario: Prevent Floating Athlete
- **WHEN** Coach tries to remove "Alice" from Group A (her only group)
- **THEN** the system rejects the request (floating athlete prevention)

### Requirement: Athlete Management
Coaches SHALL be able to manage athlete profiles directly.

#### Scenario: Coach View Athlete
- **WHEN** Coach requests athlete details
- **THEN** system returns profile if athlete belongs to coach

#### Scenario: Delete Athlete
- **WHEN** Coach explicitly deletes an athlete
- **THEN** athlete is removed from all groups, and all their data (workouts, assignments) is deleted

### Requirement: Parent Management
Coaches SHALL be able to create and manage parent accounts linked to athletes.

#### Scenario: Create Parent
- **WHEN** Coach provides name, email, and athlete ID
- **THEN** a Parent user is created and linked to that athlete
