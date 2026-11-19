"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ActionLink,
  AppShell,
  ArrowIcon,
  CheckIcon,
  ChevronLeftIcon,
  ImageIcon,
  PhotoFrame,
  StatusPill,
} from "@/components/app";
import { Button, Card, EmptyState, Field, Pill } from "@/components/ui";
import { AGENCIES, agencyById } from "@/content/agencies";
import { CATEGORY_LABELS } from "@/content/routing";
import { SEED_TICKETS } from "@/content/seed-tickets";
import { listTickets, setAgency, setStatus, subscribe } from "@/lib/store/tickets";
import type { Severity, Ticket } from "@/lib/store/types";

// Demo council inbox — FLOW §4 screen 5. Compact queue left, detail right on
// desktop; on phone the detail replaces the queue with a back button.

const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const SEVERITY_TONE: Record<Severity, "neutral" | "warn" | "bad"> = {
  low: "neutral",
  medium: "warn",
  high: "bad",
};

/** Valid-day guard: a missing or malformed date never renders "Invalid Date". */
function dayLabel(iso?: string): string | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kuala_Lumpur",
  });
}

function age(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function onPhone(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-caption font-semibold transition-colors duration-150",
        active
          ? "bg-accent-tint text-accent shadow-[inset_0_0_0_1px_rgba(10,100,214,0.45)]"
          : "glass text-ink-2 shadow-[inset_0_0_0_1px_#85858b] hover:bg-surface",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Thumb({ ticket }: { ticket: Ticket }) {
  return ticket.photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- photo is a local data URL
    <img
      src={ticket.photo}
      alt=""
      className="size-12 shrink-0 rounded-sm object-cover"
    />
  ) : (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-sunken">
      <ImageIcon className="size-5 text-muted" />
    </span>
  );
}

function Detail({
  ticket,
  onBack,
  onMove,
}: {
  ticket: Ticket;
  onBack: () => void;
  onMove: (agencyId: string) => void;
}) {
  const fixed = ticket.status === "fixed";
  const fixedDay = dayLabel(ticket.fixedAt) ?? dayLabel(ticket.updatedAt);
  const sentDay = dayLabel(ticket.createdAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:hidden">
        <Button variant="quiet" onClick={onBack} className="-ml-3">
          <ChevronLeftIcon className="size-5" />
          Back to list
        </Button>
      </div>

      {ticket.photo && !ticket.photo.startsWith("data:image/svg") && (
        <PhotoFrame
          src={ticket.photo}
          alt={`Photo of ${ticket.title}`}
          caption={ticket.place}
          ratio="2 / 1"
        />
      )}

      <Card>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={ticket.status} />
            <Pill tone={SEVERITY_TONE[ticket.severity]}>
              {SEVERITY_LABEL[ticket.severity]} severity
            </Pill>
            <span className="ml-auto text-caption text-muted tabular-nums">{ticket.id}</span>
          </div>
          <h2 className="text-title font-semibold">{ticket.title}</h2>
          <p className="text-body text-ink-2">
            {CATEGORY_LABELS[ticket.category]} · {ticket.place}
            {sentDay ? ` · sent ${sentDay}` : ""}
          </p>
          <p className="text-body text-ink-2">{ticket.description}</p>
        </div>
      </Card>

      {ticket.suggestedFix && (
        <Card title="Possible fix — not vetted">
          <p className="text-body text-ink-2">{ticket.suggestedFix}</p>
        </Card>
      )}

      {ticket.note && (
        <Card title="Note">
          <p className="text-body text-ink-2">{ticket.note}</p>
        </Card>
      )}

      <Card>
        <div className="flex flex-col gap-3">
          <Field
            label="Council or body"
            hint={
              fixed
                ? "Fixed reports keep their body."
                : "Suggested — correct it if needed"
            }
          >
            <select
              value={ticket.agencyId}
              disabled={fixed}
              onChange={(e) => onMove(e.target.value)}
            >
              {AGENCIES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.short} — {a.name}
                </option>
              ))}
            </select>
          </Field>

          {fixed && (
            <p className="flex min-h-12 items-center justify-center gap-2 text-body font-semibold">
              <CheckIcon className="size-5 shrink-0 text-good" />
              {fixedDay ? `Fixed on ${fixedDay}` : "Marked fixed"}
            </p>
          )}

          <ActionLink variant="quiet" href={`/ticket/${ticket.id}`} className="self-start">
            View public ticket
          </ActionLink>
        </div>
      </Card>
    </div>
  );
}

export default function InboxPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // tick 0 = first render (seeds only, matches the server); any store change bumps it.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    bump();
    return subscribe(bump);
  }, []);
  const live = tick > 0;

  const tickets = [...(live ? listTickets() : SEED_TICKETS)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const filtered =
    filter === "all" ? tickets : tickets.filter((t) => t.agencyId === filter);
  const selected = selectedId ? tickets.find((t) => t.id === selectedId) : undefined;

  function pickFilter(next: string) {
    setFilter(next);
    setSelectedId(null);
  }

  function pick(id: string) {
    setSelectedId(id);
    if (onPhone()) window.scrollTo({ top: 0 });
  }

  function backToList() {
    setSelectedId(null);
    if (onPhone()) window.scrollTo({ top: 0 });
  }

  function move(ticket: Ticket, agencyId: string) {
    const updated = setAgency(ticket.id, agencyId);
    if (updated) {
      setAnnouncement(`${ticket.id} moved to ${agencyById(agencyId)?.short ?? agencyId}.`);
    }
  }

  function mark(ticket: Ticket, next: "in_progress" | "fixed") {
    const updated = setStatus(ticket.id, next);
    if (updated) {
      setAnnouncement(`${ticket.id} marked ${next === "fixed" ? "Fixed" : "In progress"}.`);
    }
  }

  const footerAction =
    selected && (selected.status === "sent" || selected.status === "in_progress") ? (
      selected.status === "sent" ? (
        <Button
          className="w-full"
          icon={<ArrowIcon />}
          aria-label={`Mark in progress — ${selected.id}`}
          onClick={() => mark(selected, "in_progress")}
        >
          Mark in progress
        </Button>
      ) : (
        <Button
          className="w-full"
          icon={<CheckIcon />}
          aria-label={`Mark fixed — ${selected.id}`}
          onClick={() => mark(selected, "fixed")}
        >
          Mark fixed
        </Button>
      )
    ) : undefined;

  return (
    <AppShell title="Council inbox" wide footer={footerAction}>
      {/* Chip-row scrollbar in the app's own palette. */}
      <style>{`
        .inbox-chips::-webkit-scrollbar { height: 4px; }
        .inbox-chips::-webkit-scrollbar-track { background: transparent; }
        .inbox-chips::-webkit-scrollbar-thumb { background: var(--color-accent-tint-strong); border-radius: 999px; }
        .inbox-chips::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }
      `}</style>

      <div className="flex flex-col gap-4">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-semibold">Council inbox</h1>
          <Pill className="shrink-0 tabular-nums">{filtered.length} reports</Pill>
        </div>

        <div
          role="group"
          aria-label="Filter by council or body"
          className={[
            "inbox-chips -mx-4 gap-2 overflow-x-auto px-4 pb-2",
            selected ? "hidden lg:flex" : "flex",
          ].join(" ")}
        >
          <Chip active={filter === "all"} onClick={() => pickFilter("all")}>
            All
          </Chip>
          {AGENCIES.map((a) => (
            <Chip key={a.id} active={filter === a.id} onClick={() => pickFilter(a.id)}>
              {a.short}
            </Chip>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <section aria-label="Reports" className={selected ? "hidden lg:block" : undefined}>
            {filtered.length === 0 ? (
              <Card>
                <EmptyState
                  title="No reports"
                  hint={
                    filter === "all"
                      ? "Nothing raised yet."
                      : `Nothing for ${agencyById(filter)?.short ?? "this body"} yet.`
                  }
                  action={
                    filter !== "all" ? (
                      <Button variant="secondary" onClick={() => pickFilter("all")}>
                        Show all
                      </Button>
                    ) : undefined
                  }
                />
              </Card>
            ) : (
              <Card tight>
                <ul className="divide-y divide-line">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => pick(t.id)}
                        aria-current={selectedId === t.id ? "true" : undefined}
                        className={[
                          "flex min-h-[72px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
                          selectedId === t.id ? "bg-accent-tint" : "hover:bg-accent-tint/50",
                        ].join(" ")}
                      >
                        <Thumb ticket={t} />
                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 text-body font-semibold">
                            {t.title}
                          </span>
                          <span className="block truncate text-caption text-ink-2">
                            {agencyById(t.agencyId)?.short ?? t.agencyId} · {t.place} ·{" "}
                            {live ? age(t.createdAt) : (dayLabel(t.createdAt) ?? "—")}
                          </span>
                        </span>
                        <StatusPill status={t.status} className="shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          <section
            aria-label="Report detail"
            className={selected ? "lg:sticky lg:top-16" : "hidden lg:block"}
          >
            {selected ? (
              <Detail
                ticket={selected}
                onBack={backToList}
                onMove={(agencyId) => move(selected, agencyId)}
              />
            ) : (
              <Card>
                <EmptyState
                  title="No report selected"
                  hint="Pick a report from the list to review it."
                />
              </Card>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}