export function CouncilBar({
  name,
  solved,
  raised,
  medianDays,
}: {
  name: string;
  solved: number;
  raised: number;
  medianDays: number | null;
}) {
  const open = Math.max(raised - solved, 0);
  const solvedPct = raised ? (solved / raised) * 100 : 0;
  const openPct = raised ? (open / raised) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-body font-semibold">{name}</p>
      <div
        role="img"
        aria-label={`${solved} of ${raised} fixed`}
        className="flex h-2 w-full overflow-hidden rounded-full bg-sunken"
      >
        <span className="bg-accent" style={{ width: `${solvedPct}%` }} />
        <span className="bg-warn" style={{ width: `${openPct}%` }} />
      </div>
      <p className="text-caption text-ink-2 tabular-nums">
        {solved} of {raised} fixed ·{" "}
        {medianDays === null ? "no fixes yet" : `${medianDays} ${medianDays === 1 ? "day" : "days"}`}
      </p>
    </div>
  );
}
