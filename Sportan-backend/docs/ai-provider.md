# AI Provider Configuration

Sportan uses the official OpenAI Python SDK for all AI functionality (Talent Recognition and Weekly Insights). The SDK talks to whichever provider exposes an OpenAI-compatible API. By default we target Google Gemini through Google’s OpenAI shim.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `AI_API_KEY` | Provider API key (Gemini by default). | _required_ |
| `AI_BASE_URL` | OpenAI-compatible endpoint. Use Google’s shim for Gemini. | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `AI_DEFAULT_MODEL` | Model name supplied to `chat.completions`. | `gemini-2.5-flash` |

These values are defined in `.env.example`. Override them per environment to switch to another OpenAI-compatible provider (e.g., OpenAI, Kimi, Qwen).

## Runtime Notes

1. The backend creates a single `AsyncOpenAI` client with the configured key/base URL and uses it for both AI services.
2. Prompts are sent via `chat.completions.create` with a single user message containing the assembled context.
3. Logged reports store the raw text returned by the provider plus standard metadata; no provider-specific payloads are persisted.
4. If you change providers or models, ensure the target supports the Chat Completions API and the prompt tokens stay within the configured limits.
5. Errors from the SDK surface as `HTTP 502` responses with the original provider message to simplify debugging.

## Switching Providers

1. Provision a new API key with the provider you want to use.
2. Update `AI_API_KEY`, `AI_BASE_URL`, and (optionally) `AI_DEFAULT_MODEL` in the environment or secret manager.
3. Redeploy the backend; no code changes are required as long as the provider honors the OpenAI API contract.
