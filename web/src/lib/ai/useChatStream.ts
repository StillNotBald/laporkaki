"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatStreamMessage = { role: "user" | "assistant"; content: string };
export type ChatStreamStatus = "idle" | "waiting" | "streaming" | "error";

const FALLBACK_MESSAGE = "The assistant could not answer. Please try again.";
const EMPTY_MESSAGE =
  "The assistant sent back an empty answer. Please try again.";

export function useChatStream({
  endpoint = "/api/ai/chat",
}: { endpoint?: string } = {}) {
  const [messages, setMessages] = useState<ChatStreamMessage[]>([]);
  const [status, setStatus] = useState<ChatStreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatStreamMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Abort any in-flight call when the component unmounts.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const appendToLastAssistant = useCallback((piece: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") return prev;
      return [
        ...prev.slice(0, -1),
        { ...last, content: last.content + piece },
      ];
    });
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "" || controllerRef.current) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      setError(null);
      setStatus("waiting");

      const history: ChatStreamMessage[] = [
        ...messagesRef.current,
        { role: "user", content: trimmed },
      ];
      setMessages([...history, { role: "assistant", content: "" }]);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok) {
          let message = FALLBACK_MESSAGE;
          try {
            const data = (await res.json()) as { message?: unknown };
            if (typeof data.message === "string" && data.message !== "") {
              message = data.message;
            }
          } catch {
            // keep the fallback
          }
          throw new Error(message);
        }
        if (!res.body) throw new Error(EMPTY_MESSAGE);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setStatus("streaming");
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const piece = decoder.decode(value, { stream: true });
          if (piece !== "") appendToLastAssistant(piece);
        }
        setStatus("idle");
      } catch (e) {
        if (controller.signal.aborted) {
          setStatus("idle");
        } else {
          setError(e instanceof Error && e.message ? e.message : FALLBACK_MESSAGE);
          setStatus("error");
          // Keep the user's message; drop only an empty assistant placeholder.
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && last.content === "") {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [endpoint, appendToLastAssistant],
  );

  return { messages, send, stop, status, error };
}