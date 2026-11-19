import type { HTMLAttributes } from "react";

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "info" | "good" | "warn" | "bad";
};

const tones = {
  neutral: "bg-sunken text-ink-2",
  info: "bg-info-bg text-info",
  good: "bg-good-bg text-good",
  warn: "bg-warn-bg text-warn",
  bad: "bg-surface text-bad shadow-[inset_0_0_0_1px_#b0001a]",
} as const;

export function Pill({ tone = "neutral", children, className, ...rest }: PillProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-caption font-semibold",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
