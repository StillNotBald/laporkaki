/**
 * analyse-client.ts — fetch helper + pure parser for /api/report/analyse.
 * Any junk, network error or {ai:false} collapses to {ai:false} so the
 * confirmation screen can fall back to manual fields without trapping anyone.
 * The unions below mirror CONTRACT §1; kept local so the parser stays pure.
 */
import type { Category, Severity } from "@/lib/store/types";

export const CATEGORIES = [
  "pothole",
  "streetlight",
  "drain",
  "rubbish",
  "dumping",
  "tree",
  "road-markings",
  "playground",
  "flooding",
  "abandoned-vehicle",
  "traffic-light",
  "water",
  "sewerage",
  "other",
] as const satisfies readonly Category[];

export const SEVERITIES = [
  "low",
  "medium",
  "high",
] as const satisfies readonly Severity[];

export const AGENCY_IDS = [
  "mbsj",
  "mbpj",
  "dbkl",
  "mbdk",
  "mpaj",
  "jkr",
  "tnb",
  "air-selangor",
] as const;

export type Suggestion = {
  title: string;
  category: Category;
  severity: Severity;
  description: string;
  suggestedFix: string;
  agencyId: string;
};

export type AnalyseResponse = ({ ai: true } & Suggestion) | { ai: false };

export type AnalyseInput = {
  photo: string;
  place?: string;
  coords?: { lat: number; lng: number };
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function lower(value: unknown): string {
  return cleanString(value).toLowerCase();
}

/**
 * Validate the six suggestion fields. Title, category, severity and agencyId
 * must be present and inside the unions; description and suggestedFix may be
 * empty (a fix suggestion never blocks sending). Returns null on junk.
 */
export function parseSuggestion(raw: unknown): Suggestion | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const title = cleanString(r.title);
  if (title === "") return null;
  const category = lower(r.category);
  if (!(CATEGORIES as readonly string[]).includes(category)) return null;
  const severity = lower(r.severity);
  if (!(SEVERITIES as readonly string[]).includes(severity)) return null;
  const agencyId = lower(r.agencyId);
  if (!(AGENCY_IDS as readonly string[]).includes(agencyId)) return null;
  const fix = r.suggestedFix ?? r.suggested_fix;
  return {
    title,
    category: category as Category,
    severity: severity as Severity,
    description: cleanString(r.description),
    suggestedFix: cleanString(fix),
    agencyId,
  };
}

/** Parse the route's response. Anything but a valid {ai:true,…} → {ai:false}. */
export function parseAnalyseResponse(raw: unknown): AnalyseResponse {
  if (typeof raw !== "object" || raw === null) return { ai: false };
  const r = raw as Record<string, unknown>;
  if (r.ai !== true) return { ai: false };
  const suggestion = parseSuggestion(r);
  return suggestion ? { ai: true, ...suggestion } : { ai: false };
}

/**
 * POST the photo for analysis. Never throws: timeout, network error, non-200
 * or unreadable body all resolve to {ai:false} and the manual form takes over.
 */
export async function analysePhoto(input: AnalyseInput): Promise<AnalyseResponse> {
  const controller = new AbortController();
  // The route caps at 60 s (chat timeout + one retry); give it room, then stop.
  const timer = setTimeout(() => controller.abort(), 65000);
  try {
    const res = await fetch("/api/report/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (!res.ok) return { ai: false };
    return parseAnalyseResponse(await res.json());
  } catch {
    return { ai: false };
  } finally {
    clearTimeout(timer);
  }
}