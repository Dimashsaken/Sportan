## ADDED Requirements

### Requirement: Talent Recognition
Coaches SHALL be able to run AI analysis to identify athlete potential.

#### Scenario: Run Talent Analysis
- **WHEN** Coach triggers talent recognition for an athlete
- **THEN** the system calls Google Gemini with athlete data
- **AND** stores/returns the analysis report

### Requirement: Weekly Insights
Coaches SHALL be able to generate AI summaries of weekly training.

#### Scenario: Generate Insights
- **WHEN** Coach triggers weekly insights
- **THEN** the system analyzes recent workout logs via AI
- **AND** returns a summary of progress/quality

### Requirement: Parent AI Access
Parents SHALL be able to view the latest AI reports for their child.

#### Scenario: Parent View Talent Report
- **WHEN** Parent requests talent recognition report
- **THEN** return the latest report for their child

#### Scenario: Parent View Weekly Insights
- **WHEN** Parent requests weekly insights
- **THEN** return the latest insights for their child