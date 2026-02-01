# connectivity Specification

## Purpose
TBD - created by archiving change connect-backend-api. Update Purpose after archive.
## Requirements
### Requirement: Authenticated API Access
The application SHALL communicate with the secure backend API using JWT tokens.

#### Scenario: Token Injection
- **WHEN** the app makes a request to the backend
- **THEN** the request MUST include a valid `Authorization: Bearer <token>` header
- **AND** the token MUST be obtained from the current Supabase session

#### Scenario: Session Expiry
- **WHEN** the backend returns a 401 Unauthorized
- **THEN** the app SHOULD attempt to refresh the session OR redirect the user to Login

### Requirement: Environment Configuration
The application SHALL be configurable for different environments (Dev, Prod).

#### Scenario: API URL Configuration
- **WHEN** the app starts
- **THEN** it MUST load the Base API URL from environment variables (`EXPO_PUBLIC_API_URL`)

