# ai Specification

## Purpose
TBD - created by archiving change init-backend-api. Update Purpose after archive.
## Requirements
### Requirement: Talent Recognition
Coaches SHALL be able to run AI analysis to identify athlete potential using the OpenAI SDK.

#### Scenario: Run Talent Analysis
- **WHEN** Coach triggers talent recognition for an athlete
- **THEN** the system calls the OpenAI Responses/Assistants API via the official Python client with the configured `OPENAI_API_KEY`
- **AND** the request specifies the team-approved default model (e.g., `gpt-4o`) but may be overridden per environment
- **AND** the system stores/returns the analysis report with metadata about the model used

### Requirement: Weekly Insights
Coaches SHALL be able to generate AI summaries of weekly training via the OpenAI SDK.

#### Scenario: Generate Insights
- **WHEN** Coach triggers weekly insights
- **THEN** the system aggregates the latest workouts and submits them to the OpenAI Responses/Assistants API via the official Python client
- **AND** the request uses the configured model + safety parameters
- **AND** the system returns a summary of progress/quality and stores it as the latest weekly insight

### Requirement: Parent AI Access
Parents SHALL be able to view the latest AI reports for their child.

#### Scenario: Parent View Talent Report
- **WHEN** Parent requests talent recognition report
- **THEN** return the latest report for their child

#### Scenario: Parent View Weekly Insights
- **WHEN** Parent requests weekly insights
- **THEN** return the latest insights for their child

