"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Pill } from "@/components/ui";
import type { Slide } from "./slides";

const deckStyles = `
.deck-big {
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 700;
  text-wrap: balance;
}
@keyframes deck-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.deck-enter { animation: deck-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
@media print {
  @page { size: A4 landscape; margin: 0; }
  .deck-print-slide {
    width: 297mm;
    height: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16mm;
    break-after: page;
    break-inside: avoid;
  }
  .deck-print-slide:last-child { break-after: auto; }
  .deck-big { font-size: 40pt; }
}
`;

function TbdChip() {
  return (
    <Pill tone="neutral" aria-label="To be decided">
      TBD
    </Pill>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  const router = useRouter();
  switch (slide.kind) {
    case "team":
      return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          {slide.teamTbd ? <TbdChip /> : <h1 className="deck-big text-ink">{slide.team}</h1>}
          {slide.projectTbd ? (
            <TbdChip />
          ) : (
            <p className="text-title text-ink-2">{slide.project}</p>
          )}
        </div>
      );
    case "track":
      return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          {slide.tbd ? <TbdChip /> : <h2 className="deck-big text-ink">{slide.track}</h2>}
        </div>
      );
    case "solution":
      return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          {slide.nameTbd ? <TbdChip /> : <h2 className="deck-big text-ink">{slide.name}</h2>}
          {slide.problemTbd ? (
            <TbdChip />
          ) : (
            <p className="max-w-2xl text-title text-ink-2 text-balance">{slide.problem}</p>
          )}
        </div>
      );
    case "stack":
      return (
        <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-title font-semibold text-ink">Tech stack</h2>
          <Card className="w-full px-6 py-5">
            <ul className="flex flex-col gap-3">
              {slide.items.map((item) => (
                <li key={item} className="flex items-center justify-center gap-2.5 text-title text-ink-2">
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      );
    case "usage":
      return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-5 text-center">
          <h2 className="text-title font-semibold text-ink">Qoder usage</h2>
          {slide.tbd ? (
            <TbdChip />
          ) : (
            <>
              {slide.stats.length > 0 && (
                <div className="flex flex-wrap items-stretch justify-center gap-3">
                  {slide.stats.map((stat) => (
                    <Card key={stat.label} className="flex min-w-36 flex-col items-center gap-1 px-5 py-4">
                      <span className="deck-big text-accent tabular-nums">{stat.value}</span>
                      <span className="text-caption text-muted">{stat.label}</span>
                    </Card>
                  ))}
                </div>
              )}
              {slide.summaryTbd ? (
                <TbdChip />
              ) : (
                <p className="max-w-xl text-body text-ink-2 text-balance">{slide.summary}</p>
              )}
            </>
          )}
        </div>
      );
    case "demo":
      return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-title font-semibold text-ink">Live demo</h2>
          <Button size="lg" className="px-10 text-title" onClick={() => router.push("/")}>
            Open the app
          </Button>
          {slide.videoUrl && (
            <a
              href={slide.videoUrl}
              className="text-caption font-medium text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent"
            >
              Backup video
            </a>
          )}
        </div>
      );
  }
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M10 3.5 5.5 8l4.5 4.5" /> : <path d="M6 3.5 10.5 8 6 12.5" />}
    </svg>
  );
}

export function Deck({ slides }: { slides: Slide[] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (target: number) => setIndex(Math.min(count - 1, Math.max(0, target))),
    [count],
  );
  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(count - 1, Math.max(0, i + delta))),
    [count],
  );

  useEffect(() => {
    const fromHash = () => {
      const n = Number.parseInt(window.location.hash.slice(1), 10);
      if (Number.isFinite(n)) setIndex(Math.min(count - 1, Math.max(0, n - 1)));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [count]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          step(1);
          break;
        case " ":
          if (target instanceof HTMLElement && target.closest("a,button")) return;
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          step(-1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(count - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go, step]);

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest("a,button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    step(e.clientX - rect.left > rect.width / 2 ? 1 : -1);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  };

  const slide = slides[index];
  if (!slide) return null;

  return (
    <>
      <style>{deckStyles}</style>
      <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-page p-4 print:hidden md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(42rem 30rem at 18% 12%, var(--color-accent-tint) 0%, transparent 65%), radial-gradient(38rem 28rem at 85% 90%, var(--color-sunken) 0%, transparent 65%)",
          }}
        />
        <div
          className="glass relative min-h-[calc(100svh-2rem)] w-full max-w-5xl overflow-hidden rounded-xl md:aspect-video md:min-h-0"
          onClick={onStageClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-sunken">
            <div
              className="h-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${((index + 1) / count) * 100}%` }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-6 pb-18 md:p-12">
            <div key={index} className="deck-enter flex w-full justify-center">
              <SlideView slide={slide} />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              disabled={index === 0}
              onClick={() => step(-1)}
              className="glass flex size-9 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Chevron direction="left" />
            </button>
            <span aria-live="polite" className="min-w-12 text-center text-caption text-muted tabular-nums">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              aria-label="Next slide"
              disabled={index === count - 1}
              onClick={() => step(1)}
              className="glass flex size-9 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>
      </main>

      <div className="hidden print:block">
        {slides.map((s, i) => (
          <section key={i} className="deck-print-slide" aria-label={`Slide ${i + 1} of ${count}`}>
            <SlideView slide={s} />
          </section>
        ))}
      </div>
    </>
  );
}