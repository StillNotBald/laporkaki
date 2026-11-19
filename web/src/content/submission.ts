// The one source for every submission value (see docs/SUBMISSION.md).
// The deck, README and video read from here. "TBD" stays "TBD" until the owner decides.

export const TBD = "TBD" as const;

export const submission = {
  team: "Overclock",
  project: {
    name: "LaporKaki",
    tagline: "Snap a public problem; AI routes it to the right council.",
    description:
      "Snap a photo of a pothole, blocked drain or broken streetlight. Qwen AI names the problem, rates how serious it is, suggests a fix and sends it to the right body: MBPJ, MBSJ, DBKL, JKR, TNB or Air Selangor. A public dashboard shows how many reports each council received, how many it fixed and how fast.",
    track: "Reimagine Malaysia", // owner confirmed 2026-11-19 ~12:35
  },
  inspiration:
    "Malaysians see broken roads and drains every day but don't know who to report to (council, JKR, TNB or Air Selangor) and never see what happened next. LaporKaki makes reporting one photo and makes council response times public.",
  implementation:
    "Next.js 16, React 19 and Tailwind 4. Qwen vision on Alibaba Cloud Model Studio reads the photo and returns the problem, severity, fix and responsible agency as JSON, with a rate limit and an image size cap. Hosted on Cloudflare Workers (OpenNext). Built by parallel Qoder CLI workers, each owning its own files.",
  techStack: [
    "Next.js 16 and React 19",
    "Tailwind CSS 4",
    "Qwen on Alibaba Cloud Model Studio (qwen4-max, qwen3.8-flash)",
    "Cloudflare Workers (OpenNext)",
    "Built with Qoder CLI workers",
  ],
  qoderUsage: {
    // Filled from docs/QODER-USAGE.md (npm run qoder:usage at the repo root writes both).
    summary: TBD as string,
    stats: [] as { label: string; value: string }[],
  },
  links: {
    deck: TBD as string,
    demoVideo: TBD as string,
    deploy: "https://laporkaki.stillnotbald.com",
    github: "https://github.com/StillNotBald/laporkaki",
  },
};

export type Submission = typeof submission;
