# Change: Update AI provider to OpenAI SDK

## Why
- Gemini integration locks us to a single provider and requires different payload semantics than our FastAPI services use elsewhere.
- The official OpenAI Python SDK provides a uniform client that supports synchronous/async workflows and most available OpenAI models, matching our need for flexibility in Talent Recognition and Weekly Insights.
- OpenAI's broader model catalog (GPT-4o, GPT-4.1, o-series) aligns with the product goal of running lightweight insights without repeatedly swapping providers.

## What Changes
- Replace the Google GenAI dependency with the `openai` Python SDK and wire it through our dependency management (uv / pyproject / uv.lock).
- Add configuration keys (e.g., `OPENAI_API_KEY`, optional base/model overrides) and a centralized client factory within the AI module.
- Refactor the Talent Recognition and Weekly Insights services plus routers to call the OpenAI Responses or Assistants APIs, returning the normalized payload we already store.
- Update tests and any worker/scheduled jobs to verify completion handling with the new client, including streaming/error paths.
- Refresh developer documentation to explain how to provision OpenAI keys and choose models per environment.

## Impact
- Specs: `ai/spec.md`.
- Code: AI service layer, dependency list, configuration, background jobs, tests.
- Ops: Secret management (OpenAI keys per env) and monitoring adjustments for new API endpoints.
