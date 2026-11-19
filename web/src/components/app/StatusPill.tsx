import { Pill } from "@/components/ui";

export type StatusKey = "sent" | "open" | "in_progress" | "fixed" | "refused";

const tones = {
  sent: "info",
  open: "info",
  in_progress: "warn",
  fixed: "good",
  refused: "bad",
} as const;

export const statusLabels: Record<StatusKey, string> = {
  sent: "Sent",
  open: "Open",
  in_progress: "In progress",
  fixed: "Fixed",
  refused: "Refused",
};

export function StatusPill({ status, className }: { status: StatusKey; className?: string }) {
  return (
    <Pill tone={tones[status] ?? "neutral"} className={className}>
      {statusLabels[status] ?? status}
    </Pill>
  );
}
