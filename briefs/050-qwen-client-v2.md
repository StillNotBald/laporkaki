Read `AGENTS.md`, `web/AGENTS.md`, `docs/QWEN-CAPABILITIES.md` and the current `web/src/lib/ai/qwen.ts` with its test first. Read the Next.js 16 route handler and streaming docs under `web/node_modules/next/dist/docs/` before writing the route. Note: `next.config.ts` has `cacheComponents: true`, so a route must NOT export `dynamic`; call `await connection()` from `next/server` instead (see `web/src/app/api/ai/health/route.ts`).

## Facts measured on our key (do not re-test)
- Only chat models answer: `qwen4-max`, `qwen3.8-max`, `qwen3.8-flash`. Vision, OCR, speech, image and embedding model ids return 403.
- Those three chat models DO accept images as `image_url` content parts with a base64 data URL.
- Thinking is on by default and adds about 3.5 s. The request field `enable_thinking: false` turns it off (flash answers in about 0.6 s, first stream chunk in about 0.4 s).
- Tool calling and `response_format: { type: "json_object" }` work.

## Job: extend the client, keep every existing export and test working

### Files you own (edit or create only these)
- `web/src/lib/ai/qwen.ts`
- `web/src/lib/ai/qwen.test.ts`
- `web/src/lib/ai/image.ts` and `web/src/lib/ai/image.test.ts`
- `web/src/app/api/ai/chat/route.ts`
- `web/src/lib/ai/useChatStream.ts`

### `qwen.ts`
1. `ChatOptions.thinking?: boolean`, default `false`. Always send `enable_thinking` with that value, in `chat`, `chatJson` and `chatStream`.
2. `ChatOptions.fast?: boolean`: when true and no `model` is given, use `QWEN_FAST_MODEL` or `qwen3.8-flash`.
3. Message content may be a string or parts: `{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }`. Export the types.
4. Tool calling: `ChatOptions.tools?: ToolSpec[]` (OpenAI function tool shape) and `toolChoice?`. `ChatResult` success gains `toolCalls?: { id: string; name: string; arguments: unknown }[]` with arguments already JSON-parsed (bad JSON gives `arguments: null`). A reply with tool calls and empty text is success, not `empty`. Allow `role: "tool"` messages with `tool_call_id` and assistant messages carrying `tool_calls` so a caller can send results back.
5. `runTools(messages, tools, handlers, options?)`: loops chat, runs each requested handler (`Record<string, (args: unknown) => Promise<unknown> | unknown>`), appends results, stops at a text answer or after `maxSteps` (default 4). A handler that throws sends `{ error: "<plain message>" }` back to the model. Returns the final `ChatResult` plus `steps: { name: string; args: unknown; result: unknown }[]`.

### `image.ts`
`toDataUrl(bytes: Uint8Array, mime: string): string` and `checkImage(bytes, declaredMime)`: accept only PNG, JPEG and WebP verified by magic bytes (not the declared type), refuse over 4 MB, return `{ ok: true; mime } | { ok: false; message }` with a plain message. Reuse a standard magic-byte approach.

### `route.ts` (`POST /api/ai/chat`)
Body `{ messages: {role, content: string}[], fast?: boolean }`. Validate: at most 30 messages, each content at most 4000 characters, roles `user` or `assistant` only (the system prompt is added on the server from a constant `SYSTEM_PROMPT` in the file, placeholder text for now). Stream plain text chunks (`text/plain; charset=utf-8`, `Cache-Control: no-store`) from `chatStream`. On failure before the first chunk return JSON `{ message }` with status 502 (400 for bad input, 503 when not configured). Never echo upstream error bodies.

### `useChatStream.ts` (client hook, `"use client"`)
`useChatStream({ endpoint = "/api/ai/chat" })` returns `{ messages, send(text), stop(), status: "idle" | "waiting" | "streaming" | "error", error }`. Appends chunks to the last assistant message as they arrive, aborts on `stop()` and on unmount, keeps the user's message when a call fails.

### Tests (vitest, mocked fetch, fake timers; keep the 14 existing tests green)
Add: thinking flag sent false by default and true when asked; `fast` picks the fast model; image parts pass through unchanged; tool calls parsed, bad arguments give null; `runTools` happy path, handler throw, `maxSteps` stop; `checkImage` accepts real PNG/JPEG/WebP headers, refuses a text file named `.png`, refuses over 4 MB.

## When done
Run `cd web && npm run typecheck` and `cd web && npx vitest run` and fix what fails. No git. No installs. No other file. Report under 150 words: files, test count, what you reused, anything not done.
