import type { ReactNode } from "react";
import { AlertIcon, CheckIcon, InfoIcon } from "./icons";

const tones = {
  info: { box: "glass text-ink", icon: "text-accent", Icon: InfoIcon },
  warn: { box: "bg-warn-bg text-ink", icon: "text-warn", Icon: AlertIcon },
  good: { box: "bg-good-bg text-ink", icon: "text-good", Icon: CheckIcon },
  bad: { box: "bg-surface text-ink shadow-[inset_0_0_0_1px_#b0001a]", icon: "text-bad", Icon: AlertIcon },
} as const;

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      className={["flex items-start gap-2.5 rounded-md px-3.5 py-3 text-caption", t.box, className]
        .filter(Boolean)
        .join(" ")}
    >
      <t.Icon className={["mt-px size-[18px] shrink-0", t.icon].join(" ")} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
