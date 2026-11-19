Read `AGENTS.md` (repo root) and `web/AGENTS.md` first. The app is in `web/` (Next.js 16, App Router, TypeScript, `src/` dir, alias `@/*`). Read the Next.js route handler guide under `web/node_modules/next/dist/docs/` before writing the route.

## Job
A small server-only client for Qwen over the OpenAI-compatible chat endpoint. Plain `fetch`, no new dependency.

## Files you own (create only these)
- `web/src/lib/ai/qwen.ts`
- `web/src/lib/ai/qwen.test.ts`
- `web/src/app/api/ai/health/route.ts`

## `qwen.ts`
- First line: `import "server-only"` is NOT available (not installed). Instead throw at call time if `typeof window !== "undefined"`.
- Env, read at call time (not module load): `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `QWEN_MODEL` (default `qwen4-max`).
- Types: `ChatMessage { role: "system" | "user" | "assistant"; content: string }`, `ChatOptions { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number; json?: boolean; signal?: AbortSignal }`.
- `chat(messages, options?) : Promise<ChatResult>` where `ChatResult = { ok: true; text: string; model: string; usage?: { promptTokens: number; completionTokens: number } } | { ok: false; reason: "not_configured" | "timeout" | "http" | "empty" | "network"; status?: number; message: string }`. It never throws for those cases.
  - POST `${OPENAI_BASE_URL}/chat/completions` with `Authorization: Bearer <key>`.
  - Timeout by `AbortController`, default 30000 ms.
  - Exactly one retry, only for network errors, timeouts, HTTP 429 and HTTP 5xx. Wait 400 ms before the retry. No retry on other 4xx.
  - `json: true` sends `response_format: { type: "json_object" }`.
  - `message` is a plain sentence a user could read. It never contains the key, the base URL or the raw response body.
- `chatJson<T>(messages, options?) : Promise<{ ok: true; data: T } | { ok: false; reason: ...; message: string }>`: calls `chat` with `json: true`, parses the text, strips a ```json fence if the model added one, returns `reason: "empty"` with a plain message when parsing fails.
- `chatStream(messages, options?) : AsyncGenerator<string>`: `stream: true`, parses SSE `data:` lines, yields `choices[0].delta.content` pieces, stops at `[DONE]`, ignores `reasoning_content`. No retry here. Throws an `Error` with a plain message on failure.
- Export a tiny `isConfigured(): boolean`.

## `route.ts`
`GET /api/ai/health`, `export const dynamic = "force-dynamic"`. Returns JSON `{ configured: boolean, model: string }` only. No network call, no key, no base URL in the response.

## `qwen.test.ts` (vitest, node environment)
Mock `globalThis.fetch` with `vi.fn`, set env with `vi.stubEnv`. Use fake timers where waiting is involved. Cover at least:
1. not configured returns `not_configured` and calls fetch zero times
2. happy path returns text, model and usage, and sends the bearer header and the model
3. HTTP 500 then 200: two fetch calls, ok result
4. HTTP 400: one fetch call, `http` with status 400
5. HTTP 429 twice: two calls, `http` with status 429
6. timeout: `timeout` result
7. `message` never contains the key value (assert on a fake key string) for every failure case
8. `chatJson` parses plain JSON and fenced JSON, and reports bad JSON as `empty`
9. `chatStream` yields the pieces in order from a fake SSE body split across chunks mid-line

## Rules
No git. No shell commands. No other file. End with a report under 150 words listing the files and anything you could not do.
