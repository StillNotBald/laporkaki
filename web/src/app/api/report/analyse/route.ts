/**
 * /api/report/analyse — CONTRACT §5. One fast JSON-mode chat call over the
 * photo; every failure path answers 200 {ai:false} so the client can fall
 * back to manual fields. No key or raw upstream error text ever leaves here.
 */
import { connection } from "next/server";
import { chat, type ChatMessage } from "@/lib/ai/qwen";
import { checkImage } from "@/lib/ai/image";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import {
  AGENCY_IDS,
  CATEGORIES,
  SEVERITIES,
  parseSuggestion,
} from "@/lib/report/analyse-client";

export const maxDuration = 60;

const SYSTEM_PROMPT = [
  "You triage photos of public problems in Malaysia's Klang Valley for a citizen report app.",
  "Look at the photo and reply with ONLY one JSON object, no markdown, with exactly these keys:",
  '"title": a short plain-English name of the problem, at most 8 words.',
  `"category": exactly one of: ${CATEGORIES.join(", ")}.`,
  `"severity": exactly one of: ${SEVERITIES.join(", ")}. Use high only when someone could be hurt soon.`,
  '"description": one or two plain sentences describing what is visible. Do not invent details you cannot see.',
  '"suggestedFix": one possible next step in plain words, or an empty string if unsure. It is a suggestion, never a verified or safe repair plan.',
  `"agencyId": exactly one of: ${AGENCY_IDS.join(", ")}.`,
  "Agency routing hints: streetlight problems go to tnb; water leaks or supply problems go to air-selangor; traffic-light faults go to jkr.",
  "Everything else (including sewerage) goes to the council for the place: Subang Jaya, Puchong or Seri Kembangan -> mbsj; Petaling Jaya -> mbpj; Kuala Lumpur -> dbkl; Klang or Port Klang -> mbdk; Ampang or Pandan -> mpaj.",
  "If the place is unknown or outside these areas, use mbsj. These are suggestions the citizen will check, not decisions.",
].join("\n");

function aiFalse(): Response {
  return Response.json({ ai: false });
}

function parseDataUrl(
  photo: string,
): { bytes: Uint8Array; mime: string } | null {
  const match = photo.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (!match) return null;
  try {
    const bytes = new Uint8Array(Buffer.from(match[2], "base64"));
    const check = checkImage(bytes, match[1].toLowerCase());
    if (!check.ok) return null;
    return { bytes, mime: check.mime };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  // cacheComponents is on: opt into request-time rendering without `dynamic`.
  await connection();
  // Same abuse guard as the chat route: this endpoint spends the team key too.
  const limited = checkRateLimit(request);
  if (limited) return limited;
  try {
    const body = (await request.json()) as {
      photo?: unknown;
      place?: unknown;
      coords?: unknown;
    };
    const photo = typeof body?.photo === "string" ? body.photo : "";
    if (!photo || !parseDataUrl(photo)) return aiFalse();

    const place =
      typeof body.place === "string" ? body.place.trim().slice(0, 200) : "";
    let coordsText = "";
    const c = body.coords as { lat?: unknown; lng?: unknown } | undefined;
    if (
      c &&
      typeof c.lat === "number" &&
      typeof c.lng === "number" &&
      Number.isFinite(c.lat) &&
      Number.isFinite(c.lng)
    ) {
      coordsText = ` Coordinates: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}.`;
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Place: ${place || "unknown"}.${coordsText} What is the problem in this photo?`,
          },
          { type: "image_url", image_url: { url: photo } },
        ],
      },
    ];

    // Timeout + one retry already live inside chat().
    const result = await chat(messages, {
      fast: true,
      json: true,
      thinking: false,
      maxTokens: 400,
      signal: request.signal,
    });
    if (!result.ok) return aiFalse();

    let text = result.text.trim();
    const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fenced) text = fenced[1].trim();
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return aiFalse();
    }
    const suggestion = parseSuggestion(raw);
    if (!suggestion) return aiFalse();
    return Response.json({ ai: true, ...suggestion });
  } catch {
    return aiFalse();
  }
}