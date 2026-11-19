// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chat,
  chatJson,
  chatStream,
  isConfigured,
  runTools,
  STREAM_INTERRUPTED_MESSAGE,
} from "./qwen";
import type { ChatMessage, ToolSpec } from "./qwen";
import { checkImage, toDataUrl } from "./image";

// The route calls connection() from next/server; outside a real Next request
// there is no request store, so stub it for the route-level tests below.
vi.mock("next/server", () => ({ connection: async () => {} }));

const KEY = "sk-fake-secret-key-abc123";
const BASE = "https://ai.example.test/v1";
const MESSAGES = [{ role: "user" as const, content: "Hello" }];

const fetchMock = vi.fn();

function completion(text: string, model = "qwen4-max"): Response {
  return new Response(
    JSON.stringify({
      model,
      choices: [{ message: { content: text } }],
      usage: { prompt_tokens: 3, completion_tokens: 5 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function abortingFetch() {
  fetchMock.mockImplementation(
    (_url: unknown, init: { signal: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  );
}

function toolCompletion(
  calls: { id: string; name: string; arguments: string }[],
  text = "",
): Response {
  return new Response(
    JSON.stringify({
      model: "qwen3.8-flash",
      choices: [
        {
          message: {
            content: text,
            tool_calls: calls.map((call) => ({
              id: call.id,
              type: "function",
              function: { name: call.name, arguments: call.arguments },
            })),
          },
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function sentBody(index: number) {
  return JSON.parse(fetchMock.mock.calls[index][1].body);
}

const PNG_SIGNATURE_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Bytes that pass the PNG magic-byte check, of any size. */
function pngBytes(size = 16): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set(PNG_SIGNATURE_BYTES);
  return bytes;
}

function pngDataUrl(size = 16): string {
  return toDataUrl(pngBytes(size), "image/png");
}

/** A stream that delivers one text delta, then breaks on the next read. */
function brokenStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let pulls = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      pulls += 1;
      if (pulls === 1) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`,
          ),
        );
      } else {
        controller.error(new Error(`upstream exploded ${KEY}`));
      }
    },
  });
}

/** One SSE response carrying a single text delta, then [DONE]. */
function sseResponse(text: string): Response {
  const delta = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
  return new Response(`${delta}data: [DONE]\n\n`, { status: 200 });
}

const WEATHER_TOOL: ToolSpec = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Look up the weather for a city",
    parameters: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"],
    },
  },
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENAI_BASE_URL", BASE);
  vi.stubEnv("OPENAI_API_KEY", KEY);
  vi.stubEnv("QWEN_MODEL", "");
  vi.stubEnv("QWEN_FAST_MODEL", "");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("chat", () => {
  it("returns not_configured without calling fetch when env is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await chat(MESSAGES);
    expect(result).toMatchObject({ ok: false, reason: "not_configured" });
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(isConfigured()).toBe(false);
  });

  it("returns text, model and usage, and sends bearer header and model", async () => {
    fetchMock.mockResolvedValueOnce(completion("Hi there"));
    const result = await chat(MESSAGES);
    expect(result).toEqual({
      ok: true,
      text: "Hi there",
      model: "qwen4-max",
      usage: { promptTokens: 3, completionTokens: 5 },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/chat/completions`);
    expect(init.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(JSON.parse(init.body).model).toBe("qwen4-max");
    expect(isConfigured()).toBe(true);
  });

  it("uses QWEN_MODEL and options.model when given", async () => {
    vi.stubEnv("QWEN_MODEL", "qwen-plus");
    fetchMock.mockResolvedValueOnce(completion("ok", "qwen-plus"));
    await chat(MESSAGES);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("qwen-plus");

    fetchMock.mockResolvedValueOnce(completion("ok", "qwen-turbo"));
    await chat(MESSAGES, { model: "qwen-turbo" });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe("qwen-turbo");
  });

  it("retries once after HTTP 500 and succeeds", async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(completion("Recovered"));
    const promise = chat(MESSAGES);
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ ok: true, text: "Recovered" });
  });

  it("does not retry HTTP 400", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bad request", { status: 400 }));
    const result = await chat(MESSAGES);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: false, reason: "http", status: 400 });
  });

  it("retries once on HTTP 429 then gives up with status 429", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => new Response("slow down", { status: 429 }));
    const promise = chat(MESSAGES);
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ ok: false, reason: "http", status: 429 });
  });

  it("returns timeout when the request hangs", async () => {
    vi.useFakeTimers();
    abortingFetch();
    const promise = chat(MESSAGES, { timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(2400);
    const result = await promise;
    expect(result).toMatchObject({ ok: false, reason: "timeout" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never leaks the key or base URL in any failure message", async () => {
    vi.useFakeTimers();
    const scenarios: Array<() => void> = [
      () => vi.stubEnv("OPENAI_API_KEY", ""),
      () => fetchMock.mockImplementation(async () => new Response(KEY, { status: 400 })),
      () => fetchMock.mockImplementation(async () => new Response(KEY, { status: 429 })),
      () => fetchMock.mockImplementation(async () => new Response(KEY, { status: 500 })),
      () => fetchMock.mockRejectedValue(new Error(`connect failed ${KEY} ${BASE}`)),
      () => fetchMock.mockImplementation(async () => new Response(KEY, { status: 200 })),
      () => abortingFetch(),
    ];
    for (const setup of scenarios) {
      fetchMock.mockReset();
      vi.stubEnv("OPENAI_API_KEY", KEY);
      setup();
      const promise = chat(MESSAGES, { timeoutMs: 1000 });
      await vi.advanceTimersByTimeAsync(5000);
      const result = await promise;
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message.length).toBeGreaterThan(0);
        expect(result.message).not.toContain(KEY);
        expect(result.message).not.toContain(BASE);
      }
    }
  });
});

describe("chatJson", () => {
  it("parses plain JSON and requests json_object", async () => {
    fetchMock.mockResolvedValueOnce(completion('{"answer":42}'));
    const result = await chatJson<{ answer: number }>(MESSAGES);
    expect(result).toEqual({ ok: true, data: { answer: 42 } });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).response_format).toEqual({
      type: "json_object",
    });
  });

  it("strips a ```json fence", async () => {
    fetchMock.mockResolvedValueOnce(completion('```json\n{"answer":42}\n```'));
    const result = await chatJson<{ answer: number }>(MESSAGES);
    expect(result).toEqual({ ok: true, data: { answer: 42 } });
  });

  it("reports bad JSON as empty with a plain message", async () => {
    fetchMock.mockResolvedValueOnce(completion("sorry, I cannot help with that"));
    const result = await chatJson(MESSAGES);
    expect(result).toMatchObject({ ok: false, reason: "empty" });
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).not.toContain(KEY);
    }
  });
});

describe("chatStream", () => {
  it("yields pieces in order from SSE split across chunks mid-line", async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\ndata: {"choices":[{"delta":{"re',
      'asoning_content":"thinking hard"}}]}\n\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
      'data: [DONE]\n\ndata: {"choices":[{"delta":{"content":"AFTER_DONE"}}]}\n\n',
    ];
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));

    const pieces: string[] = [];
    for await (const piece of chatStream(MESSAGES)) pieces.push(piece);

    expect(pieces).toEqual(["Hel", "lo"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true);
  });

  it("throws a plain error on HTTP failure without leaking the key", async () => {
    // 400 is not retryable: exactly one attempt, plain message, no key.
    fetchMock.mockResolvedValueOnce(new Response(KEY, { status: 400 }));
    let error: unknown;
    try {
      for await (const piece of chatStream(MESSAGES)) void piece;
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message.length).toBeGreaterThan(0);
    expect((error as Error).message).not.toContain(KEY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws a plain error when not configured", async () => {
    vi.stubEnv("OPENAI_BASE_URL", "");
    let error: unknown;
    try {
      for await (const piece of chatStream(MESSAGES)) void piece;
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });
});

describe("thinking and fast options", () => {
  it("sends enable_thinking false by default in chat, chatJson and chatStream", async () => {
    fetchMock.mockResolvedValueOnce(completion("ok"));
    await chat(MESSAGES);
    expect(sentBody(0).enable_thinking).toBe(false);

    fetchMock.mockResolvedValueOnce(completion('{"a":1}'));
    await chatJson(MESSAGES);
    expect(sentBody(1).enable_thinking).toBe(false);

    fetchMock.mockResolvedValueOnce(
      new Response("data: [DONE]\n\n", { status: 200 }),
    );
    for await (const piece of chatStream(MESSAGES)) void piece;
    expect(sentBody(2).enable_thinking).toBe(false);
  });

  it("sends enable_thinking true when asked", async () => {
    fetchMock.mockResolvedValueOnce(completion("ok"));
    await chat(MESSAGES, { thinking: true });
    expect(sentBody(0).enable_thinking).toBe(true);
  });

  it("fast picks qwen3.8-flash, QWEN_FAST_MODEL overrides, explicit model wins", async () => {
    fetchMock.mockResolvedValueOnce(completion("ok", "qwen3.8-flash"));
    await chat(MESSAGES, { fast: true });
    expect(sentBody(0).model).toBe("qwen3.8-flash");

    vi.stubEnv("QWEN_FAST_MODEL", "qwen3.8-max");
    fetchMock.mockResolvedValueOnce(completion("ok", "qwen3.8-max"));
    await chat(MESSAGES, { fast: true });
    expect(sentBody(1).model).toBe("qwen3.8-max");

    fetchMock.mockResolvedValueOnce(completion("ok", "qwen4-max"));
    await chat(MESSAGES, { fast: true, model: "qwen4-max" });
    expect(sentBody(2).model).toBe("qwen4-max");
  });
});

describe("content parts", () => {
  it("passes valid image and text parts through unchanged", async () => {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: pngDataUrl() } },
          { type: "text", text: "What is in this picture?" },
        ],
      },
    ];
    fetchMock.mockResolvedValueOnce(completion("A cat"));
    const result = await chat(messages);
    expect(result).toMatchObject({ ok: true, text: "A cat" });
    expect(sentBody(0).messages).toEqual(messages);
  });
});

describe("tool calling", () => {
  it("parses tool calls with empty text as success and sends tools", async () => {
    fetchMock.mockResolvedValueOnce(
      toolCompletion([
        { id: "call_1", name: "get_weather", arguments: '{"city":"Kuala Lumpur"}' },
      ]),
    );
    const result = await chat(MESSAGES, {
      tools: [WEATHER_TOOL],
      toolChoice: "auto",
    });
    expect(result).toMatchObject({
      ok: true,
      text: "",
      toolCalls: [
        { id: "call_1", name: "get_weather", arguments: { city: "Kuala Lumpur" } },
      ],
    });
    expect(sentBody(0).tools).toEqual([WEATHER_TOOL]);
    expect(sentBody(0).tool_choice).toBe("auto");
  });

  it("gives arguments null when the JSON is bad", async () => {
    fetchMock.mockResolvedValueOnce(
      toolCompletion([{ id: "call_2", name: "get_weather", arguments: "{oops" }]),
    );
    const result = await chat(MESSAGES, { tools: [WEATHER_TOOL] });
    expect(result).toMatchObject({
      ok: true,
      toolCalls: [{ id: "call_2", name: "get_weather", arguments: null }],
    });
  });
});

describe("runTools", () => {
  it("runs the handler, sends the result back and stops at a text answer", async () => {
    fetchMock
      .mockResolvedValueOnce(
        toolCompletion([
          { id: "call_1", name: "get_weather", arguments: '{"city":"Kuala Lumpur"}' },
        ]),
      )
      .mockResolvedValueOnce(completion("It is sunny.", "qwen3.8-flash"));
    const handler = vi.fn(() => ({ tempC: 31 }));
    const { result, steps } = await runTools(
      MESSAGES,
      [WEATHER_TOOL],
      { get_weather: handler },
      { fast: true },
    );
    expect(result).toMatchObject({ ok: true, text: "It is sunny." });
    expect(handler).toHaveBeenCalledWith({ city: "Kuala Lumpur" });
    expect(steps).toEqual([
      { name: "get_weather", args: { city: "Kuala Lumpur" }, result: { tempC: 31 } },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const second = sentBody(1).messages;
    expect(second[1]).toMatchObject({
      role: "assistant",
      tool_calls: [
        {
          id: "call_1",
          type: "function",
          function: { name: "get_weather", arguments: '{"city":"Kuala Lumpur"}' },
        },
      ],
    });
    expect(second[2]).toEqual({
      role: "tool",
      tool_call_id: "call_1",
      content: '{"tempC":31}',
    });
  });

  it("sends only the plain TOOL_FAILED message when a handler throws", async () => {
    fetchMock
      .mockResolvedValueOnce(
        toolCompletion([{ id: "call_1", name: "get_weather", arguments: "{}" }]),
      )
      .mockResolvedValueOnce(completion("Sorry, I could not check."));
    const { result, steps } = await runTools(MESSAGES, [WEATHER_TOOL], {
      get_weather: () => {
        throw new Error(`internal detail ${KEY}`);
      },
    });
    expect(result).toMatchObject({ ok: true, text: "Sorry, I could not check." });
    // The raw handler message must never reach the model or the user.
    expect(steps[0].result).toEqual({
      error: "The action failed. Please try again.",
    });
    const toolMessage = sentBody(1).messages[2];
    expect(toolMessage).toEqual({
      role: "tool",
      tool_call_id: "call_1",
      content: '{"error":"The action failed. Please try again."}',
    });
    expect(toolMessage.content).not.toContain(KEY);
    expect(toolMessage.content).not.toContain("internal detail");
  });

  it("stops after maxSteps when the model keeps calling tools", async () => {
    fetchMock.mockImplementation(async () =>
      toolCompletion([{ id: "call_x", name: "get_weather", arguments: "{}" }]),
    );
    const { result, steps } = await runTools(
      MESSAGES,
      [WEATHER_TOOL],
      { get_weather: () => ({ tempC: 30 }) },
      { maxSteps: 2 },
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(steps).toHaveLength(2);
    expect(result.ok).toBe(true);
  });
});

describe("chatStream resilience", () => {
  it("retries exactly once before the first chunk on HTTP 500", async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(sseResponse("Recovered"));
    const pieces: string[] = [];
    const consuming = (async () => {
      for await (const piece of chatStream(MESSAGES)) pieces.push(piece);
    })();
    await vi.advanceTimersByTimeAsync(400);
    await consuming;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pieces).toEqual(["Recovered"]);
  });

  it("gives up after one retry when the failure persists", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => new Response("boom", { status: 500 }));
    let error: unknown;
    const consuming = (async () => {
      try {
        for await (const piece of chatStream(MESSAGES)) void piece;
      } catch (e) {
        error = e;
      }
    })();
    await vi.advanceTimersByTimeAsync(400);
    await consuming;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((error as Error).message).not.toContain(KEY);
  });

  it("does not retry a non-retryable HTTP 400", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bad", { status: 400 }));
    let error: unknown;
    try {
      for await (const piece of chatStream(MESSAGES)) void piece;
    } catch (e) {
      error = e;
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(Error);
  });

  it("ends with one plain fallback sentence when the stream breaks mid-answer", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(brokenStream("Hel"), { status: 200 }),
    );

    const pieces: string[] = [];
    // Must not throw: the answer already started.
    for await (const piece of chatStream(MESSAGES)) pieces.push(piece);
    expect(pieces).toEqual(["Hel", `\n\n${STREAM_INTERRUPTED_MESSAGE}`]);
    expect(pieces.join("")).not.toContain(KEY);
    // No retry after the first chunk.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps a healthy stream alive past the timeout when chunks keep arriving", async () => {
    vi.useFakeTimers();
    const encoder = new TextEncoder();
    let ctrl!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        ctrl = controller;
      },
    });
    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));

    const pieces: string[] = [];
    const consuming = (async () => {
      for await (const piece of chatStream(MESSAGES, { timeoutMs: 1000 })) {
        pieces.push(piece);
      }
    })();
    await vi.advanceTimersByTimeAsync(10);
    // 2.7 s total wall time with a chunk every 0.9 s: an idle timeout must
    // reset per chunk, a total timeout would abort this healthy stream.
    for (const text of ["A", "B", "C"]) {
      ctrl.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`,
        ),
      );
      await vi.advanceTimersByTimeAsync(900);
    }
    ctrl.enqueue(encoder.encode("data: [DONE]\n\n"));
    ctrl.close();
    await consuming;
    expect(pieces).toEqual(["A", "B", "C"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still aborts after a silent gap longer than the idle timeout", async () => {
    vi.useFakeTimers();
    const encoder = new TextEncoder();
    let ctrl!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        ctrl = controller;
      },
    });
    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));

    const pieces: string[] = [];
    const consuming = (async () => {
      for await (const piece of chatStream(MESSAGES, { timeoutMs: 1000 })) {
        pieces.push(piece);
      }
    })();
    await vi.advanceTimersByTimeAsync(10);
    ctrl.enqueue(
      encoder.encode('data: {"choices":[{"delta":{"content":"A"}}]}\n\n'),
    );
    await vi.advanceTimersByTimeAsync(1100);
    await consuming;
    expect(pieces).toEqual(["A", `\n\n${STREAM_INTERRUPTED_MESSAGE}`]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("image validation", () => {
  it("caps images at 3 MB so the encoded body stays under Vercel's 4.5 MB", () => {
    const MAX = 3 * 1024 * 1024;
    expect(checkImage(pngBytes(MAX), "image/png").ok).toBe(true);
    const over = checkImage(pngBytes(MAX + 1), "image/png");
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.message).toContain("3 MB");
  });

  it("chat rejects non-image bytes in an image_url part without calling fetch", async () => {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: "data:image/png;base64,QUJD" } },
        ],
      },
    ];
    const result = await chat(messages);
    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).not.toContain(KEY);
    }
  });

  it("chat rejects an oversized image before sending it upstream", async () => {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: pngDataUrl(3 * 1024 * 1024 + 1) },
          },
        ],
      },
    ];
    const result = await chat(messages);
    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    if (!result.ok) expect(result.message).toContain("3 MB");
  });

  it("chat rejects image links that are not base64 data URLs", async () => {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: "https://evil.example/x.png" } },
        ],
      },
    ];
    const result = await chat(messages);
    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it("chatStream throws a plain error for a bad image before any fetch", async () => {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: "data:image/png;base64,QUJD" } },
        ],
      },
    ];
    let error: unknown;
    try {
      for await (const piece of chatStream(messages)) void piece;
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain(KEY);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });
});

describe("chat route", () => {
  async function loadRoute() {
    // Fresh module per test: the rate limiter keeps module-level state.
    vi.resetModules();
    return import("@/app/api/ai/chat/route");
  }

  function chatRequest(body: unknown, ip?: string): Request {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ip) headers["x-forwarded-for"] = ip;
    return new Request("https://app.example.test/api/ai/chat", {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  const USER_BODY = { messages: [{ role: "user", content: "Hello" }] };

  function mockStream() {
    fetchMock.mockImplementation(async () => sseResponse("Hi"));
  }

  it("exports maxDuration 60 and never exports dynamic", async () => {
    const route = await loadRoute();
    expect(route.maxDuration).toBe(60);
    expect("dynamic" in route).toBe(false);
  });

  it("limits one IP to 10 requests per minute, then resets the window", async () => {
    vi.useFakeTimers();
    const route = await loadRoute();
    mockStream();
    for (let i = 0; i < 10; i++) {
      const res = await route.POST(chatRequest(USER_BODY, "1.2.3.4"));
      expect(res.status).toBe(200);
    }
    const blocked = await route.POST(chatRequest(USER_BODY, "1.2.3.4"));
    expect(blocked.status).toBe(429);
    const data = (await blocked.json()) as { message: string };
    expect(data.message.length).toBeGreaterThan(0);
    expect(data.message).not.toContain("1.2.3.4");
    expect(data.message).not.toContain(KEY);
    // Another IP is unaffected.
    expect((await route.POST(chatRequest(USER_BODY, "5.6.7.8"))).status).toBe(200);
    // After a minute the same IP may send again.
    await vi.advanceTimersByTimeAsync(61_000);
    expect((await route.POST(chatRequest(USER_BODY, "1.2.3.4"))).status).toBe(200);
  });

  it("checks the rate limit before parsing the body", async () => {
    const route = await loadRoute();
    mockStream();
    for (let i = 0; i < 10; i++) {
      await route.POST(chatRequest(USER_BODY, "1.2.3.4"));
    }
    // Invalid JSON from the same IP: still 429, not a 400 parse error.
    const res = await route.POST(chatRequest("not json", "1.2.3.4"));
    expect(res.status).toBe(429);
  });

  it("stops at the daily cap of 500 with a plain resting message", async () => {
    const route = await loadRoute();
    mockStream();
    for (let i = 0; i < 500; i++) {
      const ip = `10.0.${Math.floor(i / 10)}.${(i % 10) + 1}`;
      const res = await route.POST(chatRequest(USER_BODY, ip));
      expect(res.status).toBe(200);
    }
    const res = await route.POST(chatRequest(USER_BODY, "10.9.9.9"));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      message: "The assistant is resting. Try again tomorrow.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(500);
  });

  it("rejects a Content-Length over 150000 before parsing", async () => {
    const route = await loadRoute();
    mockStream();
    // Invalid JSON, but oversized: the size guard must answer first.
    const req = new Request("https://app.example.test/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "content-length": "150001",
      },
      body: "not json",
    });
    const res = await route.POST(req);
    expect(res.status).toBe(413);
    const data = (await res.json()) as { message: string };
    expect(data.message.length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it("requires the last message to be from the user", async () => {
    const route = await loadRoute();
    mockStream();
    const assistantLast = {
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello" },
      ],
    };
    expect((await route.POST(chatRequest(assistantLast))).status).toBe(400);
    const allAssistant = { messages: [{ role: "assistant", content: "Hello" }] };
    expect((await route.POST(chatRequest(allAssistant))).status).toBe(400);
    const userLast = {
      messages: [
        { role: "assistant", content: "Hello" },
        { role: "user", content: "Hi" },
      ],
    };
    expect((await route.POST(chatRequest(userLast))).status).toBe(200);
  });

  it("defaults to the fast model and honours fast:false", async () => {
    const route = await loadRoute();
    mockStream();
    await route.POST(chatRequest(USER_BODY));
    expect(sentBody(0).model).toBe("qwen3.8-flash");
    await route.POST(chatRequest({ ...USER_BODY, fast: false }));
    expect(sentBody(1).model).toBe("qwen4-max");
    await route.POST(chatRequest({ ...USER_BODY, fast: true }));
    expect(sentBody(2).model).toBe("qwen3.8-flash");
  });

  it("ends a broken mid-stream answer with one plain fallback sentence", async () => {
    const route = await loadRoute();
    fetchMock.mockResolvedValueOnce(
      new Response(brokenStream("Hel"), { status: 200 }),
    );
    const res = await route.POST(chatRequest(USER_BODY));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe(`Hel\n\n${STREAM_INTERRUPTED_MESSAGE}`);
    expect(text).not.toContain(KEY);
  });

  it("reports an early upstream failure as plain JSON without the key", async () => {
    const route = await loadRoute();
    fetchMock.mockResolvedValueOnce(new Response(KEY, { status: 400 }));
    const res = await route.POST(chatRequest(USER_BODY));
    expect(res.status).toBe(502);
    const data = (await res.json()) as { message: string };
    expect(data.message.length).toBeGreaterThan(0);
    expect(data.message).not.toContain(KEY);
  });
});