// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AGENCY_IDS,
  CATEGORIES,
  SEVERITIES,
  analysePhoto,
  parseAnalyseResponse,
  parseSuggestion,
} from "./analyse-client";

const VALID = {
  ai: true,
  title: "Pothole on the left lane",
  category: "pothole",
  severity: "high",
  description: "A deep pothole near the junction.",
  suggestedFix: "Patch the hole and resurface the lane.",
  agencyId: "mbsj",
};

describe("parseSuggestion", () => {
  it("accepts a valid suggestion", () => {
    expect(parseSuggestion(VALID)).toEqual({
      title: "Pothole on the left lane",
      category: "pothole",
      severity: "high",
      description: "A deep pothole near the junction.",
      suggestedFix: "Patch the hole and resurface the lane.",
      agencyId: "mbsj",
    });
  });

  it("accepts every category, severity and agency id in the unions", () => {
    for (const category of CATEGORIES) {
      for (const severity of SEVERITIES) {
        for (const agencyId of AGENCY_IDS) {
          const s = parseSuggestion({ ...VALID, category, severity, agencyId });
          expect(s).not.toBeNull();
          expect(s?.category).toBe(category);
          expect(s?.severity).toBe(severity);
          expect(s?.agencyId).toBe(agencyId);
        }
      }
    }
  });

  it("trims strings and normalises case on the union fields", () => {
    const s = parseSuggestion({
      ...VALID,
      title: "  Broken streetlight  ",
      category: "Streetlight",
      severity: "LOW",
      agencyId: "TNB",
    });
    expect(s?.title).toBe("Broken streetlight");
    expect(s?.category).toBe("streetlight");
    expect(s?.severity).toBe("low");
    expect(s?.agencyId).toBe("tnb");
  });

  it("allows an empty or missing suggestedFix and description", () => {
    const s = parseSuggestion({ ...VALID, suggestedFix: undefined, description: "" });
    expect(s?.suggestedFix).toBe("");
    expect(s?.description).toBe("");
  });

  it("accepts the snake_case fix alias", () => {
    const { suggestedFix: _drop, ...rest } = VALID;
    const s = parseSuggestion({ ...rest, suggested_fix: "Clear the drain." });
    expect(s?.suggestedFix).toBe("Clear the drain.");
  });

  it("rejects junk shapes", () => {
    for (const junk of [null, undefined, 42, "pothole", [], true]) {
      expect(parseSuggestion(junk)).toBeNull();
    }
  });

  it("rejects a missing or blank title", () => {
    expect(parseSuggestion({ ...VALID, title: undefined })).toBeNull();
    expect(parseSuggestion({ ...VALID, title: "   " })).toBeNull();
    expect(parseSuggestion({ ...VALID, title: 7 })).toBeNull();
  });

  it("rejects categories outside the union", () => {
    expect(parseSuggestion({ ...VALID, category: "volcano" })).toBeNull();
    expect(parseSuggestion({ ...VALID, category: "" })).toBeNull();
    expect(parseSuggestion({ ...VALID, category: undefined })).toBeNull();
  });

  it("rejects severities outside the union", () => {
    expect(parseSuggestion({ ...VALID, severity: "critical" })).toBeNull();
    expect(parseSuggestion({ ...VALID, severity: 3 })).toBeNull();
  });

  it("rejects agency ids outside the eight", () => {
    expect(parseSuggestion({ ...VALID, agencyId: "iwk" })).toBeNull();
    expect(parseSuggestion({ ...VALID, agencyId: "mbsa" })).toBeNull();
    expect(parseSuggestion({ ...VALID, agencyId: undefined })).toBeNull();
  });
});

describe("parseAnalyseResponse", () => {
  it("passes a valid ai:true response through", () => {
    expect(parseAnalyseResponse(VALID)).toEqual({
      ai: true,
      title: VALID.title,
      category: "pothole",
      severity: "high",
      description: VALID.description,
      suggestedFix: VALID.suggestedFix,
      agencyId: "mbsj",
    });
  });

  it("returns ai:false for an explicit ai:false", () => {
    expect(parseAnalyseResponse({ ai: false })).toEqual({ ai: false });
  });

  it("returns ai:false when ai:true carries junk fields", () => {
    expect(parseAnalyseResponse({ ai: true, category: "nope" })).toEqual({
      ai: false,
    });
    expect(parseAnalyseResponse({ ai: true })).toEqual({ ai: false });
  });

  it("returns ai:false for junk shapes and a missing ai flag", () => {
    for (const junk of [null, undefined, "ok", 1, [], { title: "x" }]) {
      expect(parseAnalyseResponse(junk)).toEqual({ ai: false });
    }
  });
});

describe("analysePhoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const input = { photo: "data:image/png;base64,AAAA" };

  it("returns the parsed suggestion on a good response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(VALID)),
    );
    const res = await analysePhoto(input);
    expect(res.ai).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "/api/report/analyse",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("falls back to ai:false on a non-200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no", { status: 500 })),
    );
    expect(await analysePhoto(input)).toEqual({ ai: false });
  });

  it("falls back to ai:false on a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect(await analysePhoto(input)).toEqual({ ai: false });
  });

  it("falls back to ai:false on an unreadable body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not json", { status: 200 })),
    );
    expect(await analysePhoto(input)).toEqual({ ai: false });
  });
});