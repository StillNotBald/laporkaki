import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, hint, action, className }: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-1.5 px-6 py-10 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-body font-semibold">{title}</p>
      {hint && <p className="text-body text-ink-2">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}