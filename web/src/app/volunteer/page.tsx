"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ActionLink,
  AppShell,
  CheckIcon,
  HandIcon,
  Notice,
  StatusPill,
} from "@/components/app";
import { Button, Card, EmptyState, Field } from "@/components/ui";
import type { Ticket } from "@/lib/store/types";
import {
  addPledge,
  getTicket,
  pledgeTotalRm,
  setVolunteerInterest,
  subscribe,
  volunteerInterest,
} from "@/lib/store/tickets";
import { PLEDGE_GOAL_RM, VOLUNTEER_TICKET_ID } from "@/content/seed-tickets";
import { agencyById } from "@/content/agencies";

function rm(n: number): string {
  return `RM${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export default function VolunteerPage() {
  const [ready, setReady] = useState(false);
  const [ticket, setTicket] = useState<Ticket | undefined>(undefined);
  const [interested, setInterested] = useState(false);
  const [totalRm, setTotalRm] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [ack, setAck] = useState("");

  useEffect(() => {
    const refresh = () => {
      setTicket(getTicket(VOLUNTEER_TICKET_ID));
      setInterested(volunteerInterest());
      setTotalRm(pledgeTotalRm());
      setReady(true);
    };
    refresh();
    return subscribe(refresh);
  }, []);

  const agency = ticket ? agencyById(ticket.agencyId) : undefined;
  const pct = Math.min(100, (totalRm / PLEDGE_GOAL_RM) * 100);

  function toggleInterest() {
    setInterested(setVolunteerInterest(!interested));
  }

  function pledge(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(value) || value <= 0) {
      setError("Enter an amount above RM0.");
      return;
    }
    if (value > 1000) {
      setError("Keep each pledge at RM1000 or less.");
      return;
    }
    const { totalRm: newTotal } = addPledge(value);
    setTotalRm(newTotal);
    setAmount("");
    setError(undefined);
    setAck(`Thank you — ${rm(value)} pledged. A promise, not a payment.`);
  }

  return (
    <AppShell title="Help out" back="/">
      <div className="flex flex-col gap-3">
        <h1 className="text-display font-semibold">Help out</h1>

        {ready && !ticket && (
          <Card>
            <EmptyState
              title="Example not found"
              hint="The demo example is missing on this browser."
            />
          </Card>
        )}

        {ticket && (
          <Card
            hero
            title={ticket.title}
            action={<StatusPill status={ticket.status} />}
          >
            <p className="text-body text-ink-2">
              {ticket.place} ·{" "}
              {agency?.short ?? ticket.agencyId}
            </p>
            <ActionLink
              href={`/ticket/${VOLUNTEER_TICKET_ID}`}
              variant="quiet"
              className="mt-1 -ml-3 self-start"
            >
              View ticket
            </ActionLink>
          </Card>
        )}

        <Notice tone="warn">
          Gloves on. Stay on the path. No roads, sharp items or lifting. Stop if unsafe.
        </Notice>

        <div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={toggleInterest}
            aria-pressed={interested}
            icon={interested ? <CheckIcon /> : <HandIcon />}
          >
            {interested ? "You're in — undo" : "I can help / Sukarelawan"}
          </Button>
          <p className="mt-2 px-1 text-caption text-ink-2" aria-live="polite">
            {interested ? "Interest saved. No one is contacted." : "Register your interest. No work is assigned."}
          </p>
        </div>

        <Card title="Pledge / Janji">
          <p className="text-caption font-semibold text-ink-2">
            No real money moves.
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            <p className="text-body text-ink-2 tabular-nums">
              {rm(totalRm)} of {rm(PLEDGE_GOAL_RM)} pledged
              {totalRm >= PLEDGE_GOAL_RM
                ? " — goal reached, thank you."
                : " for gloves and bags."}
            </p>
            <div
              role="progressbar"
              aria-label="Pledged so far"
              aria-valuemin={0}
              aria-valuemax={PLEDGE_GOAL_RM}
              aria-valuenow={Math.min(totalRm, PLEDGE_GOAL_RM)}
              className="h-2 w-full overflow-hidden rounded-full bg-sunken"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <form onSubmit={pledge} className="mt-3 flex flex-col gap-3" noValidate>
            <Field
              label="Pledge amount (RM)"
              hint="Up to RM1000 per pledge."
              error={error}
            >
              <input
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(undefined);
                }}
                placeholder="10"
              />
            </Field>
            <Button type="submit" className="w-full">
              Pledge / Janji
            </Button>
          </form>

          {ack && (
            <p className="mt-2 text-caption font-semibold text-good" aria-live="polite">
              {ack}
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}