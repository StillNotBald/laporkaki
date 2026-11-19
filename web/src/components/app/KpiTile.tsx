import type { ReactNode } from "react";

export function KpiTile({
  value,
  label,
  hero,
}: {
  value: ReactNode;
  label: ReactNode;
  hero?: boolean;
}) {
  return (
    <div
      className={[
        hero ? "card-hero" : "glass rounded-card",
        "flex flex-col gap-0.5 px-4 py-3.5",
      ].join(" ")}
      style={hero ? { borderRadius: "var(--radius-card)" } : undefined}
    >
      <span className="text-title font-semibold tabular-nums sm:text-display">{value}</span>
      <span className="text-caption text-ink-2">{label}</span>
    </div>
  );
}
