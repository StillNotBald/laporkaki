"use client";

/**
 * /report — FLOW §4 screen 2 (report-photo). Photo + optional note + place.
 * GPS and reverse geocoding are helpers only: the typed place and the body
 * select stay available at all times, so a GPS denial never traps anyone.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, ImageIcon, PhotoFrame, PinIcon } from "@/components/app";
import { Button, Card, Field } from "@/components/ui";
import {
  buttonBase,
  buttonSize,
  buttonVariants,
} from "@/components/ui/Button";
import { AGENCIES, DEFAULT_AGENCY_ID } from "@/content/agencies";
import { checkImage, toDataUrl } from "@/lib/ai/image";
import { readDraft, saveDraft } from "@/lib/report/draft";

type Coords = { lat: number; lng: number };
type LocateState = "idle" | "locating" | "named" | "pinned" | "manual";

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location is not available here."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5000,
      maximumAge: 30000,
    });
  });
}

/** Nominatim reverse geocode, 5 s cap. Any failure returns null, silently. */
async function reverseGeocode(c: Coords): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: unknown;
      address?: Record<string, unknown>;
    };
    const a = data.address ?? {};
    const pick = (...keys: string[]): string | null => {
      for (const key of keys) {
        const v = a[key];
        if (typeof v === "string" && v !== "") return v;
      }
      return null;
    };
    const local = pick(
      "neighbourhood",
      "suburb",
      "city_district",
      "town",
      "village",
      "city",
    );
    const region = pick("city", "state_district", "state");
    const parts = [local, region && region !== local ? region : null].filter(
      (p): p is string => Boolean(p),
    );
    if (parts.length > 0) return parts.join(", ");
    if (typeof data.display_name === "string" && data.display_name !== "") {
      return data.display_name.split(",").slice(0, 3).join(",").trim();
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default function ReportPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [place, setPlace] = useState("");
  const [coords, setCoords] = useState<Coords | undefined>(undefined);
  const [agencyId, setAgencyId] = useState(DEFAULT_AGENCY_ID);
  const [locate, setLocate] = useState<LocateState>("idle");
  const prefilled = useRef(false);

  // Coming back from confirmation: restore the transient draft, once.
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const d = readDraft();
    if (!d) return;
    if (d.photo) setPhoto(d.photo);
    if (d.note) setNote(d.note);
    if (d.place) setPlace(d.place);
    if (d.coords) setCoords(d.coords);
    if (d.agencyId) setAgencyId(d.agencyId);
  }, []);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const check = checkImage(bytes, file.type);
      if (!check.ok) {
        setPhotoError(check.message);
        return;
      }
      setPhoto(toDataUrl(bytes, check.mime));
    } catch {
      setPhotoError("Could not read that file. Please try another photo.");
    }
  }

  async function locatePlace() {
    setLocate("locating");
    try {
      const pos = await getPosition();
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(c);
      const name = await reverseGeocode(c);
      if (name) {
        setPlace(name);
        setLocate("named");
      } else {
        // Silent fallback: keep the pin, let the person type the place.
        setLocate("pinned");
      }
    } catch {
      setLocate("manual");
    }
  }

  function onContinue() {
    if (!photo) return;
    saveDraft({
      photo,
      note: note.trim() || undefined,
      place: place.trim() || undefined,
      coords,
      agencyId,
    });
    router.push("/report/confirm");
  }

  return (
    <AppShell
      title="Report a problem"
      back="/"
      tabs={false}
      footer={
        <div className="flex flex-col gap-1.5">
          <Button
            size="lg"
            disabled={!photo}
            onClick={onContinue}
            className="w-full"
          >
            Continue
          </Button>
          {!photo && (
            <p className="px-1 text-caption text-ink-2">
              Add a photo to continue.
            </p>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <h1 className="sr-only">Report a problem</h1>
        <Card title="Photo">
          <div className="flex flex-col gap-3">
            {photo && (
              <PhotoFrame
                src={photo}
                alt="The problem you photographed"
                ratio="2 / 1"
              />
            )}
            <label
              className={[
                buttonBase,
                buttonVariants.secondary,
                buttonSize("secondary", "md"),
                "w-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
              ].join(" ")}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  void onPick(file);
                }}
              />
              <ImageIcon aria-hidden className="size-5 shrink-0" />
              <span>{photo ? "Choose another photo" : "Take or choose a photo"}</span>
            </label>
            {photoError && (
              <p role="alert" className="px-1 text-caption font-semibold text-bad">
                {photoError}
              </p>
            )}
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-body font-semibold text-accent">
                Add a note (optional)
              </summary>
              <Field label="Note" className="pt-2">
                <textarea
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything the photo does not show."
                />
              </Field>
            </details>
          </div>
        </Card>

        <Card title="Place">
          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              icon={<PinIcon />}
              loading={locate === "locating"}
              onClick={() => void locatePlace()}
              className="w-full"
            >
              Use my location
            </Button>
            {locate === "named" && (
              <p className="px-1 text-caption text-ink-2" role="status">
                Place filled from your location — please check it.
              </p>
            )}
            {locate === "pinned" && (
              <p className="px-1 text-caption text-ink-2" role="status">
                Got your location. Type the place name below.
              </p>
            )}
            {locate === "manual" && (
              <p className="px-1 text-caption text-ink-2" role="status">
                Location is off. Type the place and choose the body below.
              </p>
            )}
            <Field label="Place">
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Jalan SS15/4, Subang Jaya"
                maxLength={200}
              />
            </Field>
            <Field
              label="Council or body"
              hint="Choose the closest area."
            >
              <select
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
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
      </div>
    </AppShell>
  );
}