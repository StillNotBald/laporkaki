import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { buttonBase, buttonSize, buttonVariants } from "@/components/ui/Button";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "md" | "lg";
  icon?: ReactNode;
  full?: boolean;
};

export function ActionLink({
  variant = "primary",
  size = "md",
  icon,
  full,
  children,
  className,
  ...rest
}: Props) {
  return (
    <Link
      className={[
        buttonBase,
        buttonVariants[variant],
        buttonSize(variant, size),
        full ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon && (
        <span aria-hidden className={variant === "primary" ? "text-accent" : undefined}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </Link>
  );
}
