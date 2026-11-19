// Shared abuse guard for every public AI route (DEPLOY.md §4, review HIGH).
// In-memory, per function instance, resets on cold start — fine for a
// one-day demo. No IPs or keys are ever logged.

const RATE_LIMIT_PER_MINUTE = 10;
const RATE_WINDOW_MS = 60_000;
const DAILY_CAP = 500;
const DAY_MS = 86_400_000;

const RATE_MESSAGE = "Too many messages. Please wait a minute and try again.";
const DAILY_MESSAGE = "The assistant is resting. Try again tomorrow.";

const rateBuckets = new Map<string, { count: number; windowStart: number }>();
let currentDay = Math.floor(Date.now() / DAY_MS);
let dailyCount = 0;

/** Returns a 429 Response when over budget, otherwise null. */
export function checkRateLimit(request: Request): Response | null {
  const now = Date.now();
  const day = Math.floor(now / DAY_MS);
  if (day !== currentDay) {
    currentDay = day;
    dailyCount = 0;
  }
  if (dailyCount >= DAILY_CAP) {
    return Response.json({ message: DAILY_MESSAGE }, { status: 429 });
  }
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_WINDOW_MS) {
    if (rateBuckets.size > 1000) {
      for (const [key, value] of rateBuckets) {
        if (now - value.windowStart >= RATE_WINDOW_MS) rateBuckets.delete(key);
      }
    }
    rateBuckets.set(ip, { count: 1, windowStart: now });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT_PER_MINUTE) {
      return Response.json({ message: RATE_MESSAGE }, { status: 429 });
    }
  }
  dailyCount += 1;
  return null;
}