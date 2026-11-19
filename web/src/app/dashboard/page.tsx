"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ActionLink,
  AppShell,
  CouncilBar,
  ImageIcon,
  KpiTile,
  StatusPill,
} from "@/components/app";
import { Card, EmptyState } from "@/components/ui";
import { agencyById } from "@/content/agencies";
import { agencyStats, listTickets, subscribe } from "@/lib/store/tickets";
import type { AgencyStats, Ticket } from "@/lib/store/types";

interface Snapshot {
  stats: AgencyStats[];
  tickets: Ticket[];
}

function age(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Overall median days from sent to fixed, across every fixed ticket. */
function overallMedianDays(tickets: Ticket[]): number | null {
  const days = tickets
    .filter((t) => t.status === "fixed" && t.fixedAt)
    .map((t) => (Date.parse(t.fixedAt as string) - Date.parse(t.createdAt)) / 86_400_000)
    .filter((d) => Number.isFinite(d) && d >= 0)
    .sort((a, b) => a - b);
  if (days.length === 0) return null;
  const mid = Math.floor(days.length / 2);
  const value = days.length % 2 === 1 ? days[mid] : (days[mid - 1] + days[mid]) / 2;
  return Math.round(value * 10) / 10;
}

function medianValue(days: number | null): string {
  if (days === null) return "—";
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

/** Fastest first, slowest last (DESIGN.md); bodies with no fixes yet go last. */
function bySpeed(a: AgencyStats, b: AgencyStats): number {
  if (a.medianDaysToFix === null && b.medianDaysToFix === null) return b.raised - a.raised;
  if (a.medianDaysToFix === null) return 1;
  if (b.medianDaysToFix === null) return -1;
  return a.medianDaysToFix - b.medianDaysToFix || b.raised - a.raised;
}

export default function DashboardPage() {
  // Null until the first client read, so server HTML never mismatches a
  // browser that already holds local reports.
  const [data, setData] = useState<Snapshot | null>(null);

  useEffect(() => {
    const update = () => setData({ stats: agencyStats(), tickets: listTickets() });
    update();
    return subscribe(update);
  }, []);

  const rows = data ? data.stats.filter((s) => s.raised > 0).sort(bySpeed) : null;
  const totalRaised = rows?.reduce((sum, s) => sum + s.raised, 0) ?? 0;
  const totalSolved = rows?.reduce((sum, s) => sum + s.solved, 0) ?? 0;
  const medianDays = data ? overallMedianDays(data.tickets) : null;
  const latest = data ? data.tickets.slice(0, 6) : [];
  const hasReports = rows !== null && totalRaised > 0;

  return (
    <AppShell title="Dashboard" wide>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-semibold">Dashboard</h1>
          {hasReports && (
            <ActionLink href="/report" className="shrink-0">
              Report a problem
            </ActionLink>
          )}
        </div>

        {!data && (
          <div aria-busy className="flex flex-col gap-4">
            <span className="sr-only">Loading figures</span>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass rounded-card px-4 py-3.5">
                  <div className="skeleton h-7 w-12" />
                  <div className="skeleton mt-2 h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="skeleton h-72 rounded-card" />
          </div>
        )}

        {rows && totalRaised === 0 && (
          <Card>
            <EmptyState
              title="No reports yet"
              hint="Send the first report and the figures appear here."
              action={<ActionLink href="/report">Report a problem</ActionLink>}
            />
          </Card>
        )}

        {hasReports && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <KpiTile value={totalRaised} label="Raised" />
              <KpiTile value={totalSolved} label="Solved" />
              <KpiTile value={medianValue(medianDays)} label="Median days to fix" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
              <Card title="By council">
                <div className="flex flex-col gap-4">
                  {rows.map((s) => (
                    <CouncilBar
                      key={s.agency.id}
                      name={s.agency.short}
                      solved={s.solved}
                      raised={s.raised}
                      medianDays={s.medianDaysToFix}
                    />
                  ))}
                </div>
              </Card>

              <Card title="Latest reports" tight>
                <ul className="divide-y divide-line">
                  {latest.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/ticket/${t.id}`}
                        className="flex min-h-[72px] items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-accent-tint/50"
                      >
                        {t.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- photo is a local data URL
                          <img
                            src={t.photo}
                            alt=""
                            className="size-12 shrink-0 rounded-sm object-cover"
                          />
                        ) : (
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-sunken">
                            <ImageIcon className="size-5 text-muted" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body font-semibold">
                            {t.title}
                          </span>
                          <span className="block truncate text-caption text-ink-2">
                            {agencyById(t.agencyId)?.short ?? t.agencyId} · {t.place} ·{" "}
                            {age(t.createdAt)}
                          </span>
                        </span>
                        <StatusPill status={t.status} className="shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}