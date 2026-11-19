import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "md" | "lg";
  loading?: boolean;
  /** Leading icon (accent coloured on primary). */
  icon?: ReactNode;
};

export const buttonVariants = {
  primary:
    "bg-[linear-gradient(180deg,#dcecff,#c7e0ff)] text-ink shadow-[inset_0_0_0_1.5px_rgba(10,100,214,0.45),0_6px_16px_-10px_rgba(10,100,214,0.45)] hover:bg-[linear-gradient(180deg,#cfe4ff,#b8d6fb)] active:scale-[0.98] disabled:bg-sunken disabled:bg-none disabled:text-ink-2 disabled:shadow-[inset_0_0_0_1px_#85858b]",
  secondary:
    "bg-glass-strong text-ink shadow-[inset_0_0_0_1px_#85858b] hover:bg-surface active:scale-[0.98] disabled:bg-sunken disabled:text-ink-2",
  quiet:
    "bg-transparent text-accent hover:bg-accent-tint disabled:text-ink-2 disabled:bg-sunken",
  danger:
    "bg-surface text-bad shadow-[inset_0_0_0_1.5px_#b0001a] hover:bg-grouped active:scale-[0.98] disabled:bg-sunken disabled:text-ink-2 disabled:shadow-[inset_0_0_0_1px_#85858b]",
} as const;

/** Height by variant and size (spec: primary 52 / secondary 48 / quiet 44). */
export function buttonSize(variant: keyof typeof buttonVariants, size: "md" | "lg") {
  if (variant === "quiet") return "min-h-11 px-3";
  if (variant === "primary") return size === "lg" ? "min-h-13 px-6" : "min-h-13 px-5";
  return "min-h-12 px-5";
}

export const buttonBase =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-body font-semibold transition-[background,transform,box-shadow] duration-150 disabled:cursor-not-allowed [&_svg]:size-5 [&_svg]:shrink-0";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  type,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={[
        buttonBase,
        buttonVariants[variant],
        buttonSize(variant, size),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <span aria-hidden className="ui-spinner" />
      ) : icon ? (
        <span aria-hidden className={variant === "primary" ? "text-accent" : undefined}>
          {icon}
        </span>
      ) : null}
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
