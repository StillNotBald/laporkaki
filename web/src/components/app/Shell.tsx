"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, ChevronLeftIcon } from "./icons";
import { TabBar } from "./TabBar";
import { Pill } from "@/components/ui";
import { submission } from "@/content/submission";

export function AppShell({
  title,
  back,
  children,
  footer,
  wide,
  tabs,
}: {
  title?: string;
  back?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  tabs?: boolean;
}) {
  const pathname = usePathname();
  const onInbox = pathname.startsWith("/inbox");
  const switchLink = onInbox
    ? { href: "/", label: "Citizen view" }
    : { href: "/inbox", label: "Council view" };
  const showTabs = tabs ?? !onInbox;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass-bar sticky top-0 z-20 h-12 shrink-0">
        <div
          className={[
            "mx-auto flex h-full items-center gap-2 px-4",
            wide ? "max-w-[430px] lg:max-w-[1040px]" : "max-w-[430px]",
          ].join(" ")}
        >
          {back ? (
            <Link
              href={back}
              aria-label="Back"
              className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-accent hover:bg-accent-tint"
            >
              <ChevronLeftIcon className="size-[22px]" />
            </Link>
          ) : (
            <BrandMark className="size-[22px] shrink-0 text-accent" />
          )}
          <span className="min-w-0 flex-1 truncate text-body font-semibold">
            {title ?? submission.project.name}
          </span>
          <Pill>Demo</Pill>
          <Link
            href={switchLink.href}
            className="flex min-h-11 items-center whitespace-nowrap px-1 text-caption font-semibold text-accent"
          >
            {switchLink.label}
          </Link>
        </div>
      </header>
      <main
        className={[
          "page-enter mx-auto w-full flex-1 px-4 pt-4",
          wide ? "max-w-[430px] lg:max-w-[1040px]" : "max-w-[430px]",
        ].join(" ")}
        style={{
          paddingBottom: showTabs
            ? "var(--tabbar-space)"
            : footer
              ? "16px"
              : "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>
      {footer && (
        <div
          className="glass-bar sticky z-20 border-b-0 border-t-[0.5px] border-line"
          style={{ bottom: showTabs ? "calc(var(--tabbar-h) + 8px + env(safe-area-inset-bottom))" : 0 }}
        >
          <div className="mx-auto max-w-[430px] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        </div>
      )}
      {showTabs && <TabBar />}
    </div>
  );
}
