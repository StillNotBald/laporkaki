import { submission, TBD, type Submission } from "@/content/submission";

export type Stat = { label: string; value: string };

export type Slide =
  | {
      kind: "team";
      team: string;
      teamTbd: boolean;
      project: string;
      projectTbd: boolean;
    }
  | { kind: "track"; track: string; tbd: boolean }
  | {
      kind: "solution";
      name: string;
      nameTbd: boolean;
      problem: string;
      problemTbd: boolean;
    }
  | { kind: "stack"; items: string[] }
  | {
      kind: "usage";
      stats: Stat[];
      summary: string;
      summaryTbd: boolean;
      tbd: boolean;
    }
  | { kind: "demo"; videoUrl: string | null };

const isTbd = (value: string) => value === TBD;
const orEmpty = (value: string) => (isTbd(value) ? "" : value);

export function buildSlides(source: Submission = submission): Slide[] {
  const { project, qoderUsage, links } = source;
  const summaryTbd = isTbd(qoderUsage.summary);
  return [
    {
      kind: "team",
      team: orEmpty(source.team),
      teamTbd: isTbd(source.team),
      project: orEmpty(project.name),
      projectTbd: isTbd(project.name),
    },
    { kind: "track", track: orEmpty(project.track), tbd: isTbd(project.track) },
    {
      kind: "solution",
      name: orEmpty(project.name),
      nameTbd: isTbd(project.name),
      problem: orEmpty(project.tagline),
      problemTbd: isTbd(project.tagline),
    },
    { kind: "stack", items: [...source.techStack] },
    {
      kind: "usage",
      stats: qoderUsage.stats.map((s) => ({ ...s })),
      summary: orEmpty(qoderUsage.summary),
      summaryTbd,
      tbd: qoderUsage.stats.length === 0 && summaryTbd,
    },
    { kind: "demo", videoUrl: isTbd(links.demoVideo) ? null : links.demoVideo },
  ];
}