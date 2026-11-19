import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside" | "li";
  title?: ReactNode;
  action?: ReactNode;
  /** One per screen: the lead card. */
  hero?: boolean;
  /** No padding, for lists. */
  tight?: boolean;
};

export function Card({
  as: Tag = "div",
  title,
  action,
  hero,
  tight,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={[
        hero ? "card-hero" : "glass rounded-card",
        tight ? "overflow-hidden p-0" : hero ? "p-4.5" : "p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {(title || action) && (
        <div
          className={[
            "flex min-h-6 items-center justify-between gap-2",
            tight ? "px-4 pt-4 pb-2" : "mb-2.5",
          ].join(" ")}
        >
          {title ? <h3 className="text-title font-semibold">{title}</h3> : <span />}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}
