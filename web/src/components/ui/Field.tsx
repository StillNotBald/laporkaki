import { cloneElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement<{
    id?: string;
    className?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
  className?: string;
};

export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  const controlId = children.props.id ?? id;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const control = cloneElement(children, {
    id: controlId,
    className: [children.props.className, "input"].filter(Boolean).join(" "),
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  });

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <label htmlFor={controlId} className="px-1 text-caption font-semibold text-ink-2">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="px-1 text-caption text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="px-1 text-caption text-bad">
          {error}
        </p>
      )}
    </div>
  );
}