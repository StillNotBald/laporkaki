import { describe, expect, it } from "vitest";
import { submission, TBD, type Submission } from "@/content/submission";
import { buildSlides } from "./slides";

function filledSubmission(): Submission {
  return {
    ...submission,
    team: "Overclock",
    project: {
      name: "Sample project",
      tagline: "One line about the problem.",
      description: "A description.",
      track: "Reimagine Malaysia",
    },
    qoderUsage: {
      summary: "Built by workers from briefs.",
      stats: [
        { label: "Briefs", value: "24" },
        { label: "Workers", value: "6" },
        { label: "Credits", value: "1200" },
      ],
    },
    links: { ...submission.links, demoVideo: "https://example.com/video" },
  };
}

describe("buildSlides", () => {
  it("builds six slides in the pitch order", () => {
    const slides = buildSlides();
    expect(slides.map((s) => s.kind)).toEqual([
      "team",
      "track",
      "solution",
      "stack",
      "usage",
      "demo",
    ]);
  });

  it("turns TBD values into tbd flags, never text", () => {
    const slides = buildSlides({
      ...submission,
      project: { name: TBD, tagline: TBD, description: TBD, track: TBD },
      qoderUsage: { summary: TBD, stats: [] },
    });
    expect(JSON.stringify(slides)).not.toContain(TBD);

    const [team, track, solution, , usage] = slides;
    expect(team).toMatchObject({ team: "Overclock", teamTbd: false, projectTbd: true });
    expect(track).toMatchObject({ tbd: true, track: "" });
    expect(solution).toMatchObject({ nameTbd: true, problemTbd: true });
    expect(usage).toMatchObject({ tbd: true, stats: [], summaryTbd: true });
  });

  it("carries decided values through without tbd flags", () => {
    const slides = buildSlides(filledSubmission());
    expect(JSON.stringify(slides)).not.toContain(TBD);

    const [team, track, solution, stack, usage] = slides;
    expect(team).toMatchObject({ team: "Overclock", teamTbd: false, project: "Sample project", projectTbd: false });
    expect(track).toMatchObject({ track: "Reimagine Malaysia", tbd: false });
    expect(solution).toMatchObject({ name: "Sample project", problem: "One line about the problem.", nameTbd: false, problemTbd: false });
    expect(stack).toMatchObject({ items: submission.techStack });
    expect(usage).toMatchObject({ tbd: false, summaryTbd: false, summary: "Built by workers from briefs." });
    if (usage?.kind === "usage") expect(usage.stats).toHaveLength(3);
  });

  it("hides the backup video link when the video is TBD", () => {
    const demo = buildSlides()[5];
    expect(demo).toEqual({ kind: "demo", videoUrl: null });
  });

  it("shows the backup video link once the video is decided", () => {
    const demo = buildSlides(filledSubmission())[5];
    expect(demo).toEqual({ kind: "demo", videoUrl: "https://example.com/video" });
  });
});