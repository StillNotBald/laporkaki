"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, ChartIcon, HandIcon } from "./icons";

const tabs = [
  { href: "/", label: "Report", Icon: CameraIcon },
  { href: "/dashboard", label: "Dashboard", Icon: ChartIcon },
  { href: "/volunteer", label: "Help out", Icon: HandIcon },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-[calc(8px+env(safe-area-inset-bottom))]"
    >
      <div className="tab-bar pointer-events-auto flex h-16 w-full max-w-[414px] items-stretch gap-1 rounded-full p-1">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" ||
                pathname.startsWith("/report") ||
                pathname.startsWith("/ticket")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-caption font-semibold text-ink transition-colors duration-150",
                active ? "bg-btn-top" : "hover:bg-accent-tint",
              ].join(" ")}
            >
              <Icon className={["size-[22px]", active ? "text-accent" : "text-ink"].join(" ")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
