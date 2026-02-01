## ADDED Requirements

### Requirement: User Identification
The system SHALL identify users based on Supabase Auth JWTs.

#### Scenario: Coach Identity
- **WHEN** a request arrives with a valid JWT and `role=coach`
- **THEN** the system resolves the Coach profile associated with `user_id`

#### Scenario: Athlete Identity
- **WHEN** a request arrives with `role=athlete`
- **THEN** the system resolves the Athlete profile

#### Scenario: Parent Identity
- **WHEN** a request arrives with `role=parent`
- **THEN** the system resolves the Parent profile and their linked Child (Athlete)

### Requirement: Profile Access
Users SHALL be able to view their own profiles (or their child's).

#### Scenario: Coach Me
- **WHEN** Coach requests `/coach/me`
- **THEN** return Coach details

#### Scenario: Parent View Child
- **WHEN** Parent requests child profile
- **THEN** return the linked Athlete's profile
