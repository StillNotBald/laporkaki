import { checkImage } from "./image";

export type TextPart = { type: "text"; text: string };
export type ImagePart = { type: "image_url"; image_url: { url: string } };
export type ContentPart = TextPart | ImagePart;

/** Wire shape of an assistant tool call (arguments are a JSON string). */
export type ToolCallRequest = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: "system" | "user"; content: string | ContentPart[] }
  | {
      role: "assistant";
      content: string | ContentPart[];
      tool_calls?: ToolCallRequest[];
    }
  | { role: "tool"; content: string; tool_call_id: string };

/** OpenAI function tool shape. */
export type ToolSpec = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoice =
  | "auto"
  | "none"
  | "required"
  | { type: "function"; function: { name: string } };

/** A tool call with arguments already JSON-parsed (null when unparseable). */
export type ParsedToolCall = { id: string; name: string; arguments: unknown };

export type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  json?: boolean;
  signal?: AbortSignal;
  /** Sent as enable_thinking. Default false: thinking adds about 3.5 s. */
  thinking?: boolean;
  /** Pick the fast model (QWEN_FAST_MODEL or qwen3.8-flash) when no model is given. */
  fast?: boolean;
  tools?: ToolSpec[];
  toolChoice?: ToolChoice;
};

export type ChatFailureReason =
  | "not_configured"
  | "timeout"
  | "http"
  | "empty"
  | "network"
  | "invalid";

export type ChatResult =
  | {
      ok: true;
      text: string;
      model: string;
      usage?: { promptTokens: number; completionTokens: number };
      toolCalls?: ParsedToolCall[];
    }
  | {
      ok: false;
      reason: ChatFailureReason;
      status?: number;
      message: string;
    };

export type ChatJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ChatFailureReason; message: string };

const DEFAULT_MODEL = "qwen4-max";
const FAST_MODEL = "qwen3.8-flash";
const DEFAULT_TIMEOUT_MS = 30000;
const RETRY_DELAY_MS = 400;

const NOT_CONFIGURED_MESSAGE =
  "The assistant is not set up yet. Please ask the team to add the AI settings.";
const TIMEOUT_MESSAGE =
  "The assistant took too long to answer. Please try again.";
const NETWORK_MESSAGE =
  "We could not reach the assistant service. Please try again.";
const EMPTY_MESSAGE =
  "The assistant sent back an empty answer. Please try again.";
const UNREADABLE_MESSAGE =
  "The assistant sent back an answer we could not read. Please try again.";
const IMAGE_LINK_MESSAGE =
  "Please attach the picture as an upload, not a link.";
/** One plain sentence appended when a stream breaks after it started. */
export const STREAM_INTERRUPTED_MESSAGE =
  "The answer stopped early. Please try again.";

function assertServer(): void {
  if (typeof window !== "undefined") {
    throw new Error("The assistant can only be called on the server.");
  }
}

function readConfig() {
  return {
    baseUrl: process.env.OPENAI_BASE_URL || "",
    key: process.env.OPENAI_API_KEY || "",
    model: process.env.QWEN_MODEL || DEFAULT_MODEL,
  };
}

export function isConfigured(): boolean {
  const { baseUrl, key } = readConfig();
  return baseUrl !== "" && key !== "";
}

function httpMessage(status: number): string {
  if (status === 429) {
    return "The assistant is busy right now. Please try again in a moment.";
  }
  if (status >= 500) {
    return "The assistant service hit a problem. Please try again.";
  }
  return "The assistant service could not take this request. Please try again.";
}

/**
 * Validate every image_url part with checkImage (magic bytes + size cap).
 * Returns a plain error message, or null when all parts are safe to send.
 */
function findImageProblem(messages: ChatMessage[]): string | null {
  for (const message of messages) {
    if (typeof message.content === "string") continue;
    for (const part of message.content) {
      if (part.type !== "image_url") continue;
      const url = part.image_url?.url;
      if (typeof url !== "string") return IMAGE_LINK_MESSAGE;
      const match = /^data:([^;,]*);base64,([\s\S]*)$/.exec(url);
      if (!match) return IMAGE_LINK_MESSAGE;
      let bytes: Uint8Array;
      try {
        const binary = atob(match[2]);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      } catch {
        return IMAGE_LINK_MESSAGE;
      }
      const check = checkImage(bytes, match[1]);
      if (!check.ok) return check.message;
    }
  }
  return null;
}

function buildBody(
  messages: ChatMessage[],
  options: ChatOptions,
  defaultModel: string,
): Record<string, unknown> {
  const imageProblem = findImageProblem(messages);
  if (imageProblem) throw new Error(imageProblem);
  const fastModel = process.env.QWEN_FAST_MODEL || FAST_MODEL;
  const body: Record<string, unknown> = {
    model: options.model || (options.fast ? fastModel : defaultModel),
    messages,
    enable_thinking: options.thinking ?? false,
  };
  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
  if (options.json) body.response_format = { type: "json_object" };
  if (options.tools && options.tools.length > 0) body.tools = options.tools;
  if (options.toolChoice !== undefined) body.tool_choice = options.toolChoice;
  return body;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type CompletionResponse = {
  model?: unknown;
  choices?: {
    message?: { content?: unknown; tool_calls?: unknown };
  }[];
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
};

function parseToolCalls(raw: unknown): ParsedToolCall[] {
  if (!Array.isArray(raw)) return [];
  const calls: ParsedToolCall[] = [];
  for (const entry of raw as {
    id?: unknown;
    function?: { name?: unknown; arguments?: unknown };
  }[]) {
    const id = entry?.id;
    const name = entry?.function?.name;
    if (typeof id !== "string" || typeof name !== "string") continue;
    const rawArgs = entry?.function?.arguments;
    let args: unknown = null;
    if (typeof rawArgs === "string") {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = null;
      }
    }
    calls.push({ id, name, arguments: args });
  }
  return calls;
}

async function attemptChat(
  url: string,
  key: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<ChatResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        reason: "http",
        status: res.status,
        message: httpMessage(res.status),
      };
    }
    let data: CompletionResponse;
    try {
      data = (await res.json()) as CompletionResponse;
    } catch {
      return { ok: false, reason: "empty", message: UNREADABLE_MESSAGE };
    }
    const message = data?.choices?.[0]?.message;
    const content = message?.content;
    const toolCalls = parseToolCalls(message?.tool_calls);
    const text = typeof content === "string" ? content : "";
    if (text.trim() === "" && toolCalls.length === 0) {
      return { ok: false, reason: "empty", message: EMPTY_MESSAGE };
    }
    const result: ChatResult = {
      ok: true,
      text,
      model: typeof data.model === "string" ? data.model : String(body.model),
    };
    if (toolCalls.length > 0) result.toolCalls = toolCalls;
    const prompt = data.usage?.prompt_tokens;
    const completion = data.usage?.completion_tokens;
    if (typeof prompt === "number" && typeof completion === "number") {
      result.usage = { promptTokens: prompt, completionTokens: completion };
    }
    return result;
  } catch {
    if (timedOut) {
      return { ok: false, reason: "timeout", message: TIMEOUT_MESSAGE };
    }
    return { ok: false, reason: "network", message: NETWORK_MESSAGE };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

function isRetryableFailure(
  reason: ChatFailureReason,
  status?: number,
): boolean {
  if (reason === "network" || reason === "timeout") return true;
  return reason === "http" && (status === 429 || (status ?? 0) >= 500);
}

function isRetryable(result: ChatResult): boolean {
  return !result.ok && isRetryableFailure(result.reason, result.status);
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  assertServer();
  const { baseUrl, key, model } = readConfig();
  if (baseUrl === "" || key === "") {
    return { ok: false, reason: "not_configured", message: NOT_CONFIGURED_MESSAGE };
  }
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  let body: Record<string, unknown>;
  try {
    body = buildBody(messages, options, model);
  } catch (error) {
    // buildBody only throws plain, safe messages (image validation).
    return {
      ok: false,
      reason: "invalid",
      message:
        error instanceof Error && error.message
          ? error.message
          : IMAGE_LINK_MESSAGE,
    };
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let result = await attemptChat(url, key, body, timeoutMs, options.signal);
  if (isRetryable(result) && !options.signal?.aborted) {
    await delay(RETRY_DELAY_MS);
    result = await attemptChat(url, key, body, timeoutMs, options.signal);
  }
  return result;
}

export async function chatJson<T>(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatJsonResult<T>> {
  const result = await chat(messages, { ...options, json: true });
  if (!result.ok) {
    return { ok: false, reason: result.reason, message: result.message };
  }
  let text = result.text.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) text = fenced[1].trim();
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, reason: "empty", message: UNREADABLE_MESSAGE };
  }
}

function sseLine(line: string): { done: boolean; text: string | null } {
  if (!line.startsWith("data:")) return { done: false, text: null };
  const payload = line.slice(5).trim();
  if (payload === "[DONE]") return { done: true, text: null };
  try {
    const data = JSON.parse(payload) as {
      choices?: { delta?: { content?: unknown } }[];
    };
    const piece = data.choices?.[0]?.delta?.content;
    return {
      done: false,
      text: typeof piece === "string" && piece !== "" ? piece : null,
    };
  } catch {
    return { done: false, text: null };
  }
}

/** Internal stream failure carrying a retry classification. Never leaks. */
class StreamFailure extends Error {
  reason: ChatFailureReason;
  status?: number;
  constructor(reason: ChatFailureReason, message: string, status?: number) {
    super(message);
    this.reason = reason;
    this.status = status;
  }
}

/**
 * One stream attempt. The timeout is idle, not total: it is re-armed on
 * every chunk received, so a healthy long stream is never cut mid-sentence.
 */
async function* streamAttempt(
  url: string,
  key: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  signal: AbortSignal | undefined,
  onPiece: () => void,
): AsyncGenerator<string> {
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const armTimer = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  };
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  armTimer();

  try {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new StreamFailure(
        timedOut ? "timeout" : "network",
        timedOut ? TIMEOUT_MESSAGE : NETWORK_MESSAGE,
      );
    }
    if (!res.ok) {
      throw new StreamFailure("http", httpMessage(res.status), res.status);
    }
    if (!res.body) {
      throw new StreamFailure("empty", EMPTY_MESSAGE);
    }

    const reader = res.body.getReader();
    // Race each read against the abort signal so the idle timeout fires even
    // if the upstream body never reacts to the abort itself.
    const readChunk = (): Promise<ReadableStreamReadResult<Uint8Array>> =>
      new Promise((resolve, reject) => {
        const onSignalAbort = () => reject(new Error("aborted"));
        if (controller.signal.aborted) {
          onSignalAbort();
          return;
        }
        controller.signal.addEventListener("abort", onSignalAbort, { once: true });
        reader.read().then(
          (value) => {
            controller.signal.removeEventListener("abort", onSignalAbort);
            resolve(value);
          },
          (error: unknown) => {
            controller.signal.removeEventListener("abort", onSignalAbort);
            reject(error);
          },
        );
      });
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      for (;;) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await readChunk();
        } catch {
          throw new StreamFailure(
            timedOut ? "timeout" : "network",
            timedOut ? TIMEOUT_MESSAGE : NETWORK_MESSAGE,
          );
        }
        if (chunk.done) break;
        armTimer(); // idle timeout: reset per chunk
        buffer += decoder.decode(chunk.value, { stream: true });
        let newline = buffer.indexOf("\n");
        while (newline >= 0) {
          const event = sseLine(buffer.slice(0, newline).trim());
          buffer = buffer.slice(newline + 1);
          if (event.done) return;
          if (event.text !== null) {
            onPiece();
            yield event.text;
          }
          newline = buffer.indexOf("\n");
        }
      }
      const event = sseLine(buffer.trim());
      if (!event.done && event.text !== null) {
        onPiece();
        yield event.text;
      }
    } finally {
      reader.cancel().catch(() => {});
    }
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {},
): AsyncGenerator<string> {
  assertServer();
  const { baseUrl, key, model } = readConfig();
  if (baseUrl === "" || key === "") {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const body = { ...buildBody(messages, options, model), stream: true };
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let started = false;
  const onPiece = () => {
    started = true;
  };
  for (let attempt = 0; ; attempt++) {
    try {
      yield* streamAttempt(url, key, body, timeoutMs, options.signal, onPiece);
      return;
    } catch (error) {
      if (started) {
        // Mid-stream failure: end with one plain sentence, no raw details.
        if (!options.signal?.aborted) {
          yield `\n\n${STREAM_INTERRUPTED_MESSAGE}`;
        }
        return;
      }
      // Exactly one retry, and only before the first chunk (mirrors chat()).
      const retryable =
        error instanceof StreamFailure &&
        isRetryableFailure(error.reason, error.status);
      if (attempt === 0 && retryable && !options.signal?.aborted) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
      if (error instanceof StreamFailure) throw new Error(error.message);
      throw error;
    }
  }
}

export type ToolHandler = (args: unknown) => Promise<unknown> | unknown;
export type ToolStep = { name: string; args: unknown; result: unknown };
export type RunToolsOptions = ChatOptions & { maxSteps?: number };
export type RunToolsResult = { result: ChatResult; steps: ToolStep[] };

const TOOL_FAILED_MESSAGE = "The action failed. Please try again.";
const TOOL_MISSING_MESSAGE = "That action is not available.";

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return JSON.stringify({ error: TOOL_FAILED_MESSAGE });
  }
}

/**
 * Chat in a loop: run each requested tool handler, send the results back,
 * and stop at a text answer or after maxSteps (default 4).
 */
export async function runTools(
  messages: ChatMessage[],
  tools: ToolSpec[],
  handlers: Record<string, ToolHandler>,
  options: RunToolsOptions = {},
): Promise<RunToolsResult> {
  const maxSteps = options.maxSteps ?? 4;
  const conversation: ChatMessage[] = [...messages];
  const steps: ToolStep[] = [];
  let result: ChatResult = {
    ok: false,
    reason: "empty",
    message: EMPTY_MESSAGE,
  };
  for (let step = 0; step < maxSteps; step++) {
    result = await chat(conversation, { ...options, tools });
    if (!result.ok) return { result, steps };
    const calls = result.toolCalls;
    if (!calls || calls.length === 0) return { result, steps };
    conversation.push({
      role: "assistant",
      content: result.text,
      tool_calls: calls.map((call) => ({
        id: call.id,
        type: "function" as const,
        function: {
          name: call.name,
          arguments: safeStringify(call.arguments),
        },
      })),
    });
    for (const call of calls) {
      const handler = handlers[call.name];
      let output: unknown;
      if (!handler) {
        output = { error: TOOL_MISSING_MESSAGE };
      } else {
        try {
          output = await handler(call.arguments);
        } catch {
          // Never forward raw handler errors: internals could reach the user.
          output = { error: TOOL_FAILED_MESSAGE };
        }
      }
      steps.push({ name: call.name, args: call.arguments, result: output });
      conversation.push({
        role: "tool",
        tool_call_id: call.id,
        content: safeStringify(output),
      });
    }
  }
  return { result, steps };
}