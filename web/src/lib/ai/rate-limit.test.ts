import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

function req(ip: string): Request {
  return new Request("http://local/api/ai/chat", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

describe("checkRateLimit", () => {
  it("allows 10 requests per minute per IP, then answers 429", () => {
    const ip = "203.0.113.7";
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(req(ip))).toBeNull();
    }
    const limited = checkRateLimit(req(ip));
    expect(limited?.status).toBe(429);
  });

  it("does not let one IP's budget affect another", () => {
    expect(checkRateLimit(req("203.0.113.8"))).toBeNull();
  });

  it("caps the whole instance at 500 AI calls per day", () => {
    // Unique IPs dodge the per-minute bucket; the daily counter still counts.
    let last: Response | null = null;
    for (let i = 0; i < 600; i++) {
      last = checkRateLimit(req(`198.51.100.${i % 250}-${i}`));
      if (last) break;
    }
    expect(last?.status).toBe(429);
  });
});