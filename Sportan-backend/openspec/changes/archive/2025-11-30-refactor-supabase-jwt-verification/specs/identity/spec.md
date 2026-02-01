## MODIFIED Requirements

### Requirement: User Identification
The system SHALL identify users based on Supabase Auth JWTs. Verification SHALL use asymmetric (ES256) cryptography with public keys dynamically fetched from the Supabase JWKS endpoint.

#### Scenario: Coach Identity
- **WHEN** a request arrives with a valid JWT signed with an asymmetric key and `role=coach`
- **THEN** the system fetches public keys from the JWKS endpoint (if not cached)
- **AND** verifies the JWT using the appropriate public key and ES256 algorithm
- **AND** resolves the Coach profile associated with `user_id`

#### Scenario: Athlete Identity
- **WHEN** a request arrives with a valid JWT signed with an asymmetric key and `role=athlete`
- **THEN** the system fetches public keys from the JWKS endpoint (if not cached)
- **AND** verifies the JWT using the appropriate public key and ES256 algorithm
- **AND** resolves the Athlete profile

#### Scenario: Parent Identity
- **WHEN** a request arrives with a valid JWT signed with an asymmetric key and `role=parent`
- **THEN** the system fetches public keys from the JWKS endpoint (if not cached)
- **AND** verifies the JWT using the appropriate public key and ES256 algorithm
- **AND** resolves the Parent profile and their linked Child (Athlete)
