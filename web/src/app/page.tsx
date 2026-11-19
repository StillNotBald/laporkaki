"use client";

import {
  ActionLink,
  AppShell,
  CameraIcon,
  PhotoFrame,
} from "@/components/app";
import { Card } from "@/components/ui";
import { submission } from "@/content/submission";

const STEPS = [
  "Snap a photo of the problem.",
  "Check the AI suggestion, then send.",
  "Track it: sent, in progress, fixed.",
];

export default function Home() {
  return (
    <AppShell title={submission.project.name}>
      <div className="flex flex-col gap-4">
        <Card hero>
          <PhotoFrame
            src="/demo/pothole.png"
            alt="A pothole on a residential street"
            caption="Pothole — Subang Jaya"
          />
          <div className="mt-4 flex flex-col gap-1">
            <h1 className="text-display font-semibold">
              Report a public problem.
            </h1>
            <p className="text-body text-ink-2">We find who fixes it.</p>
          </div>
          <ActionLink
            href="/report"
            size="lg"
            full
            icon={<CameraIcon />}
            className="mt-4"
          >
            Report a problem / Lapor
          </ActionLink>
        </Card>

        <Card title="How it works">
          <ol className="flex flex-col gap-2.5">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="w-4 shrink-0 text-body font-semibold text-accent tabular-nums"
                >
                  {i + 1}
                </span>
                <span className="text-body">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

      </div>
    </AppShell>
  );
}