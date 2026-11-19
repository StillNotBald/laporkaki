"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionLink,
  AppShell,
  ArrowIcon,
  CheckIcon,
  ChevronLeftIcon,
  Notice,
  PhotoFrame,
} from "@/components/app";
import { Button, Card, EmptyState, Field } from "@/components/ui";
import { AGENCIES, DEFAULT_AGENCY_ID, agencyById } from "@/content/agencies";
import { CATEGORY_LABELS } from "@/content/routing";
import type { Category, Draft, Severity, Ticket } from "@/lib/store/types";
import { addTicket } from "@/lib/store/tickets";
import { analysePhoto } from "@/lib/report/analyse-client";
import { clearDraft, readDraft } from "@/lib/report/draft";

type Form = {
  title: string;
  category: Category;
  severity: Severity;
  place: string;
  agencyId: string;
  description: string;
  suggestedFix: string;
};

type AiState = "loading" | "done" | "failed" | "manual";

const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function ConfirmPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState<Form>({
    title: "",
    category: "other",
    severity: "medium",
    place: "",
    agencyId: DEFAULT_AGENCY_ID,
    description: "",
    suggestedFix: "",
  });
  const [aiState, setAiState] = useState<AiState>("loading");
  const [aiFilled, setAiFilled] = useState<ReadonlySet<keyof Form>>(new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sent, setSent] = useState<Ticket | null>(null);
  const formRef = useRef(form);
  const touched = useRef(new Set<keyof Form>());
  const started = useRef(false);
  const skipAi = useRef(false);
  const sending = useRef(false);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    touched.current.add(key);
    const next = { ...formRef.current, [key]: value };
    formRef.current = next;
    setForm(next);
  }

  function fillMyself() {
    skipAi.current = true;
    setAiState("manual");
  }

  // Read the draft once, then ask for suggestions. Fields stay editable
  // while the AI works; anything the person typed is never overwritten.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const d = readDraft();
    if (!d || !d.photo) {
      setMissing(true);
      return;
    }
    setDraft(d);
    const initial: Form = {
      ...formRef.current,
      place: d.place ?? "",
      agencyId: d.agencyId ?? DEFAULT_AGENCY_ID,
    };
    formRef.current = initial;
    setForm(initial);

    void analysePhoto({ photo: d.photo, place: d.place, coords: d.coords }).then(
      (res) => {
        if (skipAi.current) return;
        if (!res.ai) {
          setAiState("failed");
          return;
        }
        const prev = formRef.current;
        const next = { ...prev };
        const filled = new Set<keyof Form>();
        const fill = <K extends keyof Form>(
          key: K,
          value: Form[K],
          untouched: boolean,
        ) => {
          if (!touched.current.has(key) && untouched) {
            next[key] = value;
            filled.add(key);
          }
        };
        fill("title", res.title, prev.title.trim() === "");
        fill("category", res.category, prev.category === "other");
        fill("severity", res.severity, prev.severity === "medium");
        fill("description", res.description, prev.description.trim() === "");
        fill("suggestedFix", res.suggestedFix, prev.suggestedFix.trim() === "");
        fill(
          "agencyId",
          res.agencyId,
          prev.agencyId === (d.agencyId ?? DEFAULT_AGENCY_ID),
        );
        formRef.current = next;
        setForm(next);
        setAiFilled(filled);
        setAiState("done");
        if (filled.has("description") || filled.has("suggestedFix")) {
          setDetailsOpen(true);
        }
      },
    );
  }, []);

  if (sent) {
    const agency = agencyById(sent.agencyId);
    return (
      <AppShell title="Sent" back="/" tabs={false}>
        <Card hero>
          <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-good-bg text-good shadow-[inset_0_0_0_1.5px_#1c6e33]">
              <CheckIcon className="size-8" />
            </span>
            <h1 className="text-display font-semibold">
              Sent to {agency?.short ?? "the body"}
            </h1>
            <p className="text-title font-semibold tabular-nums">{sent.id}</p>
            <p className="text-body text-ink-2">
              Saved to the demo inbox. Nothing is sent to a real council.
            </p>
            <ActionLink
              href={`/ticket/${sent.id}`}
              size="lg"
              full
              icon={<ArrowIcon />}
              className="mt-2"
            >
              Track my report
            </ActionLink>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (missing) {
    return (
      <AppShell title="Check and send" back="/report" tabs={false}>
        <h1 className="sr-only">Check and send</h1>
        <Card>
          <EmptyState
            title="No report to confirm"
            hint="Start with a photo of the problem."
            action={
              <Button onClick={() => router.replace("/report")}>
                Report a problem
              </Button>
            }
          />
        </Card>
      </AppShell>
    );
  }

  const canSend =
    Boolean(draft?.photo) &&
    form.title.trim() !== "" &&
    form.place.trim() !== "" &&
    form.agencyId !== "";

  function onSend() {
    if (sending.current || !draft?.photo || !canSend) return;
    sending.current = true;
    const ticket = addTicket({
      title: form.title.trim(),
      category: form.category,
      severity: form.severity,
      description: form.description.trim(),
      suggestedFix: form.suggestedFix.trim(),
      place: form.place.trim(),
      coords: draft.coords,
      agencyId: form.agencyId,
      photo: draft.photo,
      note: draft.note,
      aiSuggested: aiFilled.size > 0,
    });
    clearDraft();
    setSent(ticket);
  }

  function onCancel() {
    clearDraft();
    router.push("/report");
  }

  return (
    <AppShell
      title="Check and send"
      back="/report"
      tabs={false}
      footer={
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              disabled={!canSend}
              onClick={onSend}
              className="flex-1"
            >
              Send / Hantar
            </Button>
            <Button variant="quiet" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <p className="px-1 text-caption text-ink-2">
            {canSend ? "Saves to this browser's demo inbox." : "Add a photo, title, place and council to send."}
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <h1 className="sr-only">Check and send</h1>

        {aiState === "loading" && (
          <div className="flex items-center justify-between gap-2 px-1">
            <p
              className="flex items-center gap-2 text-body text-ink-2"
              role="status"
            >
              <span aria-hidden className="ui-spinner shrink-0 text-accent" />
              Reading your photo…
            </p>
            <Button variant="quiet" onClick={fillMyself} className="shrink-0">
              Fill it myself
            </Button>
          </div>
        )}
        {aiState === "failed" && (
          <Notice tone="warn">
            AI could not read the photo this time. Fill in the details below —
            sending still works.
          </Notice>
        )}
        {aiState === "done" && (
          <p className="px-1 text-caption text-ink-2" role="status">
            Suggested details — check before sending.
          </p>
        )}
        {aiState === "manual" && (
          <p className="px-1 text-caption text-ink-2" role="status">
            Fill in the details below — sending works the same.
          </p>
        )}

        <Card hero>
          {draft?.photo && (
            <PhotoFrame
              src={draft.photo}
              alt="The problem you photographed"
              ratio="5 / 2"
              className="mb-4"
            />
          )}
          <div className="flex flex-col gap-3">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Pothole on the left lane"
                maxLength={120}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value as Category)
                  }
                >
                  {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Severity">
                <select
                  value={form.severity}
                  onChange={(e) =>
                    update("severity", e.target.value as Severity)
                  }
                >
                  {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </div>
            <Field label="Place">
              <input
                value={form.place}
                onChange={(e) => update("place", e.target.value)}
                placeholder="e.g. Jalan SS15/4, Subang Jaya"
                maxLength={200}
              />
            </Field>
            <Field label="Council or body">
              <select
                value={form.agencyId}
                onChange={(e) => update("agencyId", e.target.value)}
              >
                {AGENCIES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.short} — {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <details
            className="group"
            open={detailsOpen}
            onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <span className="text-body font-semibold">
                Description and possible fix
              </span>
              <ChevronLeftIcon className="size-5 shrink-0 -rotate-90 text-accent transition-transform duration-150 group-open:rotate-90" />
            </summary>
            <div className="flex flex-col gap-3 pt-3">
              <Field label="Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="What is wrong, in a sentence or two."
                  maxLength={600}
                />
              </Field>
              <Field
                label="Possible fix"
                hint="Optional and not vetted — the body decides what is safe."
              >
                <textarea
                  rows={2}
                  value={form.suggestedFix}
                  onChange={(e) => update("suggestedFix", e.target.value)}
                  placeholder="e.g. Patch the hole and resurface the lane."
                  maxLength={400}
                />
              </Field>
            </div>
          </details>
        </Card>
      </div>
    </AppShell>
  );
}