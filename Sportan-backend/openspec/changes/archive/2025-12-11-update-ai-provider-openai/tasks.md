## 1. Implementation
- [x] 1.1 Remove the Gemini/Google GenAI dependency and add the `openai` Python SDK (update uv metadata).
- [x] 1.2 Introduce configuration + secret plumbing for `OPENAI_API_KEY`, optional base URL, and default model selections per env.
- [x] 1.3 Build an OpenAI client helper in the AI module (sync + async) and refactor services to call Responses/Assistants APIs.
- [x] 1.4 Update the Talent Recognition + Weekly Insights request/response mapping plus any scheduled jobs to persist the same data shape.
- [x] 1.5 Document rollout steps (API key provisioning, monitoring) and clean up obsolete Gemini config.
