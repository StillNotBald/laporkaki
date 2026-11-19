export type TimelineStep = { label: string; date?: string };

/** Vertical timeline. `current` is the index of the current step. */
export function Timeline({ steps, current }: { steps: TimelineStep[]; current: number }) {
  return (
    <ol>
      {steps.map((step, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={step.label} className="relative pb-6 pl-8 last:pb-0" aria-current={now ? "step" : undefined}>
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-[7.5px] top-5 w-px bg-line" />
            )}
            <span
              aria-hidden
              className={[
                "absolute left-0 top-1 size-4 rounded-full",
                now
                  ? "bg-page shadow-[inset_0_0_0_4px_#0a64d6]"
                  : done
                    ? "bg-accent"
                    : "bg-page shadow-[inset_0_0_0_1.5px_#85858b]",
              ].join(" ")}
            />
            <p className={["text-body", done || now ? "font-semibold text-ink" : "text-ink-2"].join(" ")}>
              {step.label}
            </p>
            {step.date && <p className="text-caption text-muted tabular-nums">{step.date}</p>}
          </li>
        );
      })}
    </ol>
  );
}
