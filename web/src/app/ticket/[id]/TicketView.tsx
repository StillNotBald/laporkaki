"use client";

import { useEffect, useState } from "react";
import {
  ActionLink,
  AppShell,
  ChartIcon,
  HandIcon,
  PhotoFrame,
  PinIcon,
  SceneArt,
  StatusPill,
  Timeline,
  type Scene,
  type TimelineStep,
} from "@/components/app";
import { Card, EmptyState, Pill } from "@/components/ui";
import { agencyById } from "@/content/agencies";
import { CATEGORY_LABELS } from "@/content/routing";
import { SEED_TICKETS, VOLUNTEER_TICKET_ID } from "@/content/seed-tickets";
import { getTicket, subscribe } from "@/lib/store/tickets";
import type { Category, Severity, Ticket, TicketStatus } from "@/lib/store/types";

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

/** Fallback drawing per category (small tile only, never the hero). */
const CATEGORY_SCENE: Record<Category, Scene> = {
  pothole: "road",
  "road-markings": "road",
  "abandoned-vehicle": "road",
  "traffic-light": "road",
  drain: "drain",
  flooding: "drain",
  sewerage: "drain",
  streetlight: "light",
  tree: "tree",
  water: "water",
  rubbish: "path",
  dumping: "path",
  playground: "path",
  other: "path",
};

const STATUS_ORDER: TicketStatus[] = ["sent", "in_progress", "fixed"];

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kuala_Lumpur",
  });
}

/** Seed "photos" are inline SVG placeholders; only a real capture is a photo. */
function realPhoto(ticket: Ticket): string | undefined {
  return ticket.photo && !ticket.photo.startsWith("data:image/svg")
    ? ticket.photo
    : undefined;
}

export default function TicketView({ id }: { id: string }) {
  // tick 0 = first render (seeds only, matches the server); any store change bumps it.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
    return subscribe(() => setTick((t) => t + 1));
  }, []);
  const live = tick > 0;

  const ticket: Ticket | undefined = live
    ? getTicket(id)
    : SEED_TICKETS.find((t) => t.id === id);

  if (!ticket) {
    return (
      <AppShell title="Ticket" back="/" tabs={false}>
        <h1 className="sr-only">Ticket</h1>
        {live ? (
          <Card>
            <EmptyState
              title="Ticket not found"
              hint="It may have been raised on another device. Reports stay in the browser that sent them."
              action={
                <ActionLink href="/" variant="secondary">
                  Back to home
                </ActionLink>
              }
            />
          </Card>
        ) : (
          <div role="status" aria-label="Loading ticket" className="flex flex-col gap-4">
            <div className="skeleton aspect-[4/3] w-full rounded-card" />
            <div className="skeleton h-7 w-2/3" />
            <div className="skeleton h-5 w-1/2" />
            <span className="sr-only">Loading ticket</span>
          </div>
        )}
      </AppShell>
    );
  }

  const agency = agencyById(ticket.agencyId);
  const councilName = agency ? `${agency.short} — ${agency.name}` : ticket.agencyId;
  const photo = realPhoto(ticket);
  const isVolunteerJob = ticket.id === VOLUNTEER_TICKET_ID;

  const current = STATUS_ORDER.indexOf(ticket.status);
  const steps: TimelineStep[] = [
    { label: "Sent", date: shortDate(ticket.createdAt) },
    {
      label: "In progress",
      date:
        ticket.status === "in_progress" ? shortDate(ticket.updatedAt) : undefined,
    },
    {
      label: "Fixed",
      date:
        ticket.status === "fixed"
          ? shortDate(ticket.fixedAt ?? ticket.updatedAt)
          : undefined,
    },
  ];

  const footer = isVolunteerJob ? (
    <ActionLink href="/volunteer" full icon={<HandIcon />}>
      Volunteer / Sukarelawan
    </ActionLink>
  ) : (
    <ActionLink href="/dashboard" full icon={<ChartIcon />}>
      Public dashboard
    </ActionLink>
  );

  return (
    <AppShell title="Ticket" back="/" tabs={false} footer={footer}>
      <div className="flex flex-col gap-3">
        <Card hero>
          <div className="flex flex-col gap-3">
            {photo ? (
              <PhotoFrame
                src={photo}
                ratio="4 / 3"
                alt={`Photo of ${ticket.title}`}
                caption={ticket.place}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 overflow-hidden rounded-sm bg-sunken">
                  <SceneArt
                    scene={CATEGORY_SCENE[ticket.category]}
                    className="block h-auto w-full"
                  />
                </div>
                <p className="text-caption text-ink-2">
                  No photo on this report. The drawing shows the kind of problem.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={ticket.status} />
              <Pill tone={SEVERITY_TONE[ticket.severity]}>
                {SEVERITY_LABEL[ticket.severity]} severity
              </Pill>
            </div>

            <h1 className="text-display font-semibold">{ticket.title}</h1>

            <div>
              <p className="text-caption font-semibold text-ink-2">Sent to</p>
              <p className="text-title font-semibold">{councilName}</p>
            </div>

            <p className="flex items-start gap-2 text-body text-ink-2">
              <PinIcon className="mt-0.5 size-5 shrink-0 text-accent" />
              {ticket.place}
            </p>

            <p className="text-caption text-ink-2 tabular-nums">
              {ticket.id} · {CATEGORY_LABELS[ticket.category]} · raised{" "}
              {shortDate(ticket.createdAt)}
            </p>

            <p className="text-body text-ink-2">{ticket.description}</p>
          </div>
        </Card>

        <Card title="Progress">
          <Timeline steps={steps} current={current} />
        </Card>

        {ticket.suggestedFix && (
          <Card title="Possible fix">
            <p className="text-body text-ink-2">{ticket.suggestedFix}</p>
            <p className="mt-2 text-caption text-muted">
              {ticket.aiSuggested ? "AI suggestion" : "Suggestion"} — not vetted by
              the council.
            </p>
          </Card>
        )}

        {ticket.note && (
          <Card title="Note from the reporter">
            <p className="text-body text-ink-2">{ticket.note}</p>
          </Card>
        )}

        {isVolunteerJob && (
          <ActionLink href="/dashboard" variant="quiet" icon={<ChartIcon />}>
            Public dashboard
          </ActionLink>
        )}
      </div>
    </AppShell>
  );
}