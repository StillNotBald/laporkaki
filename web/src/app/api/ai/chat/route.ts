import { connection } from "next/server";
import {
  chatStream,
  isConfigured,
  STREAM_INTERRUPTED_MESSAGE,
  type ChatMessage,
} from "@/lib/ai/qwen";
import { checkRateLimit } from "@/lib/ai/rate-limit";

// Keep the function alive for the whole stream (Vercel reads this export).
// cacheComponents is on: never export `dynamic`; `await connection()` below
// opts this route into request-time rendering.
export const maxDuration = 60;

// Placeholder system prompt; the product prompt lands in a later wave.
const SYSTEM_PROMPT =
  "You are a helpful assistant. Answer briefly in plain language.";

const MAX_MESSAGES = 30;
const MAX_CONTENT_CHARS = 4000;
const MAX_BODY_BYTES = 150_000;

const BAD_BODY_MESSAGE = "Send a JSON body with a list of messages.";
const BAD_MESSAGES_MESSAGE =
  "Send 1 to 30 messages, each from the user or the assistant.";
const BAD_CONTENT_MESSAGE = "Each message can be at most 4000 characters.";
const BAD_FAST_MESSAGE = "The fast option must be true or false.";
const LAST_ROLE_MESSAGE = "The last message must be from the user.";
const BODY_TOO_BIG_MESSAGE =
  "That request is too large. Please send a shorter message.";
const NOT_CONFIGURED_MESSAGE =
  "The assistant is not set up yet. Please ask the team to add the AI settings.";
const UPSTREAM_MESSAGE = "The assistant could not answer. Please try again.";

type IncomingMessage = { role: "user" | "assistant"; content: string };

function badRequest(message: string): Response {
  return Response.json({ message }, { status: 400 });
}

function parseBody(
  body: unknown,
): { messages: IncomingMessage[]; fast: boolean } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: BAD_BODY_MESSAGE };
  const { messages, fast } = body as { messages?: unknown; fast?: unknown };
  if (fast !== undefined && typeof fast !== "boolean") {
    return { error: BAD_FAST_MESSAGE };
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES
  ) {
    return { error: BAD_MESSAGES_MESSAGE };
  }
  const clean: IncomingMessage[] = [];
  for (const item of messages as unknown[]) {
    if (typeof item !== "object" || item === null) {
      return { error: BAD_MESSAGES_MESSAGE };
    }
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") {
      return { error: BAD_MESSAGES_MESSAGE };
    }
    if (typeof content !== "string") return { error: BAD_MESSAGES_MESSAGE };
    if (content.length > MAX_CONTENT_CHARS) return { error: BAD_CONTENT_MESSAGE };
    clean.push({ role, content });
  }
  if (clean[clean.length - 1].role !== "user") {
    return { error: LAST_ROLE_MESSAGE };
  }
  // Fast by default: the user is waiting on this stream.
  return { messages: clean, fast: fast !== false };
}

export async function POST(request: Request): Promise<Response> {
  // cacheComponents is on: opt into request-time rendering without `dynamic`.
  await connection();

  const limited = checkRateLimit(request);
  if (limited) return limited;

  // Reject oversized bodies before parsing (next start has no platform cap).
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ message: BODY_TOO_BIG_MESSAGE }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest(BAD_BODY_MESSAGE);
  }
  const parsed = parseBody(raw);
  if ("error" in parsed) return badRequest(parsed.error);

  if (!isConfigured()) {
    return Response.json({ message: NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...parsed.messages,
  ];
  const iterator = chatStream(messages, {
    fast: parsed.fast,
    signal: request.signal,
  });

  // Pull the first chunk before responding so any early failure can still
  // be reported as JSON. chatStream only throws plain, safe messages.
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : UPSTREAM_MESSAGE;
    return Response.json({ message }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) {
          controller.enqueue(encoder.encode(first.value));
          for await (const piece of iterator) {
            controller.enqueue(encoder.encode(piece));
          }
        }
        controller.close();
      } catch {
        // Headers are already sent; end with one plain sentence, no upstream
        // details. chatStream normally yields this itself; this is the net.
        try {
          controller.enqueue(encoder.encode(`\n\n${STREAM_INTERRUPTED_MESSAGE}`));
          controller.close();
        } catch {
          // The client is already gone.
        }
      }
    },
    cancel() {
      iterator.return(undefined).catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}