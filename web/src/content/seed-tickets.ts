// Demo seed tickets (CONTRACT §2). Demo data only — no real people, no real
// photos: every photo is a tiny inline SVG placeholder in grey/blue.
//
// The story the dashboard tells: MBSJ fixes fast (median 2 days), DBKL 4,
// MBPJ 6, MPAJ 9, MBDK slow (median 14). Air Selangor has no completed
// ticket yet ("No completed tickets"). D-021 is the featured volunteer
// litter-pick: SS15 park path, MBSJ, status sent.

import type { Category, Severity, Ticket, TicketStatus } from "@/lib/store/types";

export const VOLUNTEER_TICKET_ID = "D-021";
export const PLEDGE_GOAL_RM = 100;

// --- Tiny SVG placeholders (grey/blue shapes, not real images) ------------

function svgPhoto(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const BG = `<rect width="64" height="48" fill="#E5E7EB"/>`;
const PHOTO_ROAD = svgPhoto(
  `${BG}<ellipse cx="32" cy="30" rx="15" ry="8" fill="#9CA3AF"/><ellipse cx="32" cy="30" rx="8" ry="4" fill="#6B7280"/>`,
);
const PHOTO_DRAIN = svgPhoto(
  `${BG}<rect x="12" y="18" width="40" height="16" fill="#6B7280"/><rect x="16" y="21" width="32" height="2" fill="#E5E7EB"/><rect x="16" y="26" width="32" height="2" fill="#E5E7EB"/><path d="M10 40 Q32 34 54 40" stroke="#0A84FF" stroke-width="3" fill="none"/>`,
);
const PHOTO_LAMP = svgPhoto(
  `${BG}<rect x="30" y="12" width="4" height="30" fill="#6B7280"/><rect x="22" y="8" width="20" height="6" rx="2" fill="#9CA3AF"/><circle cx="32" cy="20" r="6" fill="#0A84FF" opacity="0.35"/>`,
);
const PHOTO_PARK = svgPhoto(
  `${BG}<path d="M0 36 Q32 26 64 36 L64 48 L0 48 Z" fill="#D1D5DB"/><circle cx="18" cy="20" r="2" fill="#6B7280"/><circle cx="40" cy="16" r="2" fill="#0A84FF"/><circle cx="50" cy="26" r="2" fill="#9CA3AF"/><circle cx="28" cy="28" r="2" fill="#0A84FF"/>`,
);
const PHOTO_DUMP = svgPhoto(
  `${BG}<rect x="14" y="22" width="16" height="14" fill="#9CA3AF"/><rect x="32" y="16" width="18" height="20" fill="#6B7280"/><rect x="20" y="14" width="10" height="8" fill="#D1D5DB"/>`,
);
const PHOTO_WATER = svgPhoto(
  `${BG}<rect x="8" y="20" width="48" height="6" fill="#9CA3AF"/><ellipse cx="32" cy="38" rx="20" ry="6" fill="#0A84FF" opacity="0.4"/><path d="M32 26 L32 34" stroke="#0A84FF" stroke-width="3"/>`,
);

// --- Seed builder ----------------------------------------------------------

interface SeedInput {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  description: string;
  suggestedFix?: string;
  place: string;
  coords?: { lat: number; lng: number };
  agencyId: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt?: string;
  fixedAt?: string;
  photo?: string;
  note?: string;
  aiSuggested?: boolean;
}

/** n days after an ISO timestamp, same time of day (keeps median math exact). */
function daysAfter(iso: string, n: number): string {
  return new Date(Date.parse(iso) + n * 86_400_000).toISOString();
}

function seedTicket(s: SeedInput): Ticket {
  const t: Ticket = {
    id: s.id,
    title: s.title,
    category: s.category,
    severity: s.severity,
    description: s.description,
    suggestedFix: s.suggestedFix ?? "",
    place: s.place,
    agencyId: s.agencyId,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.fixedAt ?? s.updatedAt ?? s.createdAt,
    aiSuggested: s.aiSuggested ?? false,
  };
  if (s.coords) t.coords = s.coords;
  if (s.fixedAt) t.fixedAt = s.fixedAt;
  if (s.photo) t.photo = s.photo;
  if (s.note) t.note = s.note;
  return t;
}

/** Fixed ticket: fixedAt is exactly `days` after createdAt. */
function fixedTicket(s: Omit<SeedInput, "status" | "fixedAt">, days: number): Ticket {
  return seedTicket({ ...s, status: "fixed", fixedAt: daysAfter(s.createdAt, days) });
}

// --- The 60 seeds (Oct–Nov 2026) -------------------------------------------

export const SEED_TICKETS: Ticket[] = [
  // MBSJ — fast: fixed in 2, 1, 3, 2 days (median 2).
  fixedTicket({
    id: "D-001", title: "Pothole on Jalan SS15/4", category: "pothole", severity: "medium",
    description: "A deep pothole in the left lane, about half a metre wide. Cars swerve around it.",
    suggestedFix: "Cold-mix patch now, resurface the lane at the next maintenance round.",
    place: "Jalan SS15/4, Subang Jaya", coords: { lat: 3.078, lng: 101.586 },
    agencyId: "mbsj", createdAt: "2026-10-02T09:10:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 2),
  fixedTicket({
    id: "D-002", title: "Blocked drain at USJ 1 market", category: "drain", severity: "high",
    description: "The monsoon drain is full of leaves and plastic. Water spills onto the walkway when it rains.",
    suggestedFix: "Clear the drain and replace the missing grate section.",
    place: "USJ 1 market, Subang Jaya", agencyId: "mbsj",
    createdAt: "2026-10-03T08:05:00+08:00", photo: PHOTO_DRAIN, aiSuggested: true,
  }, 1),
  fixedTicket({
    id: "D-003", title: "Broken swing at USJ 7 park", category: "playground", severity: "medium",
    description: "One swing seat is cracked and a chain is loose. Children are still using it.",
    suggestedFix: "Replace the seat and tighten both chains; fence off until done.",
    place: "USJ 7 community park, Subang Jaya", agencyId: "mbsj",
    createdAt: "2026-10-06T17:20:00+08:00", aiSuggested: false,
  }, 3),
  fixedTicket({
    id: "D-004", title: "Missed rubbish collection, Seri Kembangan", category: "rubbish", severity: "low",
    description: "Bins on the lane were not emptied for two rounds. Bags are piling up beside them.",
    suggestedFix: "Send a make-up collection and check the route schedule.",
    place: "Seri Kembangan lane 4", agencyId: "mbsj",
    createdAt: "2026-10-09T07:45:00+08:00", aiSuggested: false,
  }, 2),
  seedTicket({
    id: "D-005", title: "Dumped furniture behind Puchong shoplots", category: "dumping", severity: "medium",
    description: "Old sofas and mattresses dumped in the back lane. Blocking the service entrance.",
    suggestedFix: "Council cleanup crew to remove; add a no-dumping sign.",
    place: "Back lane, Bandar Puteri Puchong", agencyId: "mbsj", status: "in_progress",
    createdAt: "2026-11-08T12:30:00+08:00", updatedAt: "2026-11-12T09:00:00+08:00",
    photo: PHOTO_DUMP, aiSuggested: true,
  }),
  seedTicket({
    id: "D-006", title: "Fallen branch over Jalan Puteri 2", category: "tree", severity: "high",
    description: "A large branch came down in the storm and hangs over one lane.",
    suggestedFix: "Crew to cut and remove the branch, then check the rest of the tree.",
    place: "Jalan Puteri 2, Puchong", agencyId: "mbsj", status: "in_progress",
    createdAt: "2026-11-10T06:50:00+08:00", updatedAt: "2026-11-13T08:15:00+08:00", aiSuggested: true,
  }),
  seedTicket({
    id: "D-007", title: "Faded crossing lines near SS18 school", category: "road-markings", severity: "low",
    description: "The zebra crossing outside the school gate is almost invisible.",
    suggestedFix: "Repaint the crossing and add a slow sign.",
    place: "Jalan SS18/1, Subang Jaya", agencyId: "mbsj", status: "sent",
    createdAt: "2026-11-15T15:40:00+08:00", aiSuggested: false,
  }),

  // MBPJ — steady: 6, 5, 7 days (median 6).
  fixedTicket({
    id: "D-008", title: "Pothole near Section 14 roundabout", category: "pothole", severity: "medium",
    description: "Pothole on the exit lane of the roundabout. Motorcyclists hit it daily.",
    suggestedFix: "Patch the hole and check the surrounding surface.",
    place: "Section 14 roundabout, Petaling Jaya", coords: { lat: 3.107, lng: 101.636 },
    agencyId: "mbpj", createdAt: "2026-10-05T10:00:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 6),
  fixedTicket({
    id: "D-009", title: "Overflowing drain, Section 17 hawker row", category: "drain", severity: "high",
    description: "Grease and food waste block the drain. Smell and pooling water behind the stalls.",
    suggestedFix: "Jet-clean the drain and remind stalls to use grease traps.",
    place: "Section 17 hawker row, Petaling Jaya", agencyId: "mbpj",
    createdAt: "2026-10-08T19:25:00+08:00", aiSuggested: true,
  }, 5),
  fixedTicket({
    id: "D-010", title: "Abandoned van on Jalan 222", category: "abandoned-vehicle", severity: "low",
    description: "A van without plates has sat in the same spot for a month. Flat tyres, broken window.",
    suggestedFix: "Notice on the vehicle, then tow if unclaimed.",
    place: "Jalan 222, Petaling Jaya", agencyId: "mbpj",
    createdAt: "2026-10-10T11:10:00+08:00", aiSuggested: false,
  }, 7),
  seedTicket({
    id: "D-011", title: "Flash flood at Section 7 junction", category: "flooding", severity: "high",
    description: "After heavy rain the junction floods ankle-deep. Drains cannot take the flow.",
    suggestedFix: "Clear the inlet grates and survey the drain capacity.",
    place: "Section 7 junction, Petaling Jaya", agencyId: "mbpj", status: "in_progress",
    createdAt: "2026-11-06T18:05:00+08:00", updatedAt: "2026-11-09T10:30:00+08:00", aiSuggested: true,
  }),
  seedTicket({
    id: "D-012", title: "Loose tiles at PJ playground", category: "playground", severity: "medium",
    description: "Rubber tiles are lifting near the slide. A trip risk for small children.",
    suggestedFix: "Re-fix or replace the lifting tiles.",
    place: "Playground, Section 11, Petaling Jaya", agencyId: "mbpj", status: "sent",
    createdAt: "2026-11-14T09:35:00+08:00", aiSuggested: false,
  }),

  // DBKL — 4, 3, 5 days (median 4).
  fixedTicket({
    id: "D-013", title: "Pothole on Jalan Bangsar", category: "pothole", severity: "medium",
    description: "A wide pothole near the bus stop. Buses pull in and hit it hard.",
    suggestedFix: "Patch before the rain season; check the bus-stop approach.",
    place: "Jalan Bangsar, Kuala Lumpur", coords: { lat: 3.128, lng: 101.671 },
    agencyId: "dbkl", createdAt: "2026-10-06T08:20:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 4),
  fixedTicket({
    id: "D-014", title: "Broken drain cover, Brickfields walkway", category: "drain", severity: "high",
    description: "A concrete cover is cracked and sinks when stepped on. Pedestrians could fall through.",
    suggestedFix: "Replace the cover with a rated one and barricade until done.",
    place: "Brickfields walkway, Kuala Lumpur", agencyId: "dbkl",
    createdAt: "2026-10-12T13:15:00+08:00", photo: PHOTO_DRAIN, aiSuggested: true,
  }, 3),
  fixedTicket({
    id: "D-015", title: "Fallen tree blocking Jalan Kuchai", category: "tree", severity: "high",
    description: "A tree fell across half the road after the storm. Traffic squeezes past.",
    suggestedFix: "Remove the tree and inspect neighbouring trees.",
    place: "Jalan Kuchai Lama, Kuala Lumpur", agencyId: "dbkl",
    createdAt: "2026-10-15T07:00:00+08:00", aiSuggested: false,
  }, 5),
  seedTicket({
    id: "D-016", title: "Streetlight out, Cheras night market", category: "streetlight", severity: "medium",
    description: "The council-owned lamp by the night market entrance is out. Dark corner after 8pm.",
    suggestedFix: "Replace the lamp head and check the feeder.",
    place: "Cheras pasar malam, Kuala Lumpur", agencyId: "dbkl", status: "in_progress",
    createdAt: "2026-11-07T20:10:00+08:00", updatedAt: "2026-11-11T09:45:00+08:00", aiSuggested: false,
  }),
  seedTicket({
    id: "D-017", title: "Construction waste by Jalan Cochrane", category: "dumping", severity: "medium",
    description: "Rubble and broken tiles dumped on the road reserve.",
    suggestedFix: "Cleanup crew to remove; trace the source for enforcement.",
    place: "Jalan Cochrane, Kuala Lumpur", agencyId: "dbkl", status: "sent",
    createdAt: "2026-11-13T16:55:00+08:00", photo: PHOTO_DUMP, aiSuggested: true,
  }),

  // MBDK — slow: 12 and 16 days (median 14).
  fixedTicket({
    id: "D-018", title: "Deep pothole, Jalan Kapar", category: "pothole", severity: "high",
    description: "A pothole deep enough to damage a rim. Lorries straddle it, cars cannot.",
    suggestedFix: "Full-depth patch, not just a surface fill.",
    place: "Jalan Kapar, Klang", coords: { lat: 3.058, lng: 101.442 },
    agencyId: "mbdk", createdAt: "2026-10-03T09:50:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 12),
  fixedTicket({
    id: "D-019", title: "Silted monsoon drain, Port Klang", category: "drain", severity: "medium",
    description: "The roadside drain is silted up to half its depth. Water stands for days.",
    suggestedFix: "Desilt the stretch and clear the outfall.",
    place: "Port Klang town drain", agencyId: "mbdk",
    createdAt: "2026-10-04T10:30:00+08:00", aiSuggested: false,
  }, 16),
  seedTicket({
    id: "D-020", title: "Abandoned car, Taman Berkeley", category: "abandoned-vehicle", severity: "low",
    description: "A rusted car has occupied a visitor bay for weeks.",
    suggestedFix: "Notice, then tow if unclaimed.",
    place: "Taman Berkeley, Klang", agencyId: "mbdk", status: "in_progress",
    createdAt: "2026-11-04T14:20:00+08:00", updatedAt: "2026-11-10T11:00:00+08:00", aiSuggested: false,
  }),
  seedTicket({
    id: "D-022", title: "Water pools at Klang market after rain", category: "flooding", severity: "medium",
    description: "The market forecourt holds water for hours after rain. Shoppers walk through it.",
    suggestedFix: "Clear the perimeter drain and re-level the low spot.",
    place: "Klang market forecourt", agencyId: "mbdk", status: "sent",
    createdAt: "2026-11-12T08:40:00+08:00", aiSuggested: true,
  }),

  // The featured volunteer example (D-021): litter-pick, SS15 park path,
  // MBSJ, sent. Small, safe, community-sized job.
  seedTicket({
    id: "D-021", title: "Litter along SS15 park path", category: "rubbish", severity: "low",
    description: "Cups, wrappers and plastic bags scattered along the park jogging path. A small litter-pick would clear it.",
    suggestedFix: "Organise a volunteer litter-pick with bags and gloves; the council collects the filled bags.",
    place: "SS15 park path, Subang Jaya", coords: { lat: 3.083, lng: 101.59 },
    agencyId: "mbsj", status: "sent", createdAt: "2026-11-16T08:40:00+08:00",
    photo: PHOTO_PARK, note: "Happy to join a weekend litter-pick.", aiSuggested: false,
  }),

  // MPAJ — 9 days (median 9).
  fixedTicket({
    id: "D-023", title: "Broken slide at Pandan park", category: "playground", severity: "medium",
    description: "The slide ladder has a broken rung. Sharp edge on the slide surface.",
    suggestedFix: "Repair the ladder and smooth or replace the slide panel.",
    place: "Pandan park playground, Ampang", agencyId: "mpaj",
    createdAt: "2026-10-18T16:10:00+08:00", photo: PHOTO_PARK, aiSuggested: true,
  }, 9),
  seedTicket({
    id: "D-024", title: "Leaning tree near Ampang school", category: "tree", severity: "high",
    description: "A tree leans over the school fence after soil washed away at its base.",
    suggestedFix: "Arborist to assess; brace or remove before it falls.",
    place: "School fence, Ampang Jaya", agencyId: "mpaj", status: "in_progress",
    createdAt: "2026-11-09T07:30:00+08:00", updatedAt: "2026-11-12T10:20:00+08:00", aiSuggested: false,
  }),
  seedTicket({
    id: "D-025", title: "Bins overflowing at Pandan Indah", category: "rubbish", severity: "low",
    description: "The communal bins overflowed before the weekend collection.",
    suggestedFix: "Extra collection round; consider a bigger bin.",
    place: "Pandan Indah communal bins", agencyId: "mpaj", status: "sent",
    createdAt: "2026-11-16T18:45:00+08:00", aiSuggested: false,
  }),

  // JKR — federal road: 3 days.
  fixedTicket({
    id: "D-026", title: "Faded lane lines on FT2 near Kelana Jaya", category: "road-markings", severity: "medium",
    description: "Lane lines on the federal road are worn away. Cars drift between lanes at night.",
    suggestedFix: "Repaint the lane lines on this stretch.",
    place: "FT2 near Kelana Jaya", coords: { lat: 3.104, lng: 101.612 },
    agencyId: "jkr", createdAt: "2026-10-20T21:00:00+08:00", aiSuggested: true,
  }, 3),
  seedTicket({
    id: "D-027", title: "Traffic light out at FT2 junction", category: "traffic-light", severity: "high",
    description: "The signals at the junction are dark in all directions. Drivers guess who goes first.",
    suggestedFix: "Repair the signal controller; temporary stop signs until fixed.",
    place: "FT2 junction, Kelana Jaya", agencyId: "jkr", status: "sent",
    createdAt: "2026-11-17T07:20:00+08:00", aiSuggested: true,
  }),

  // TNB — fast: 1 day.
  fixedTicket({
    id: "D-028", title: "Dark stretch, Jalan SS2/24", category: "streetlight", severity: "medium",
    description: "Three TNB lamps in a row are out. The whole stretch is dark at night.",
    suggestedFix: "Replace the failed lamps and check the circuit.",
    place: "Jalan SS2/24, Petaling Jaya", agencyId: "tnb",
    createdAt: "2026-10-22T20:35:00+08:00", photo: PHOTO_LAMP, aiSuggested: true,
  }, 1),
  seedTicket({
    id: "D-029", title: "Flickering lamp, Puchong Jaya", category: "streetlight", severity: "low",
    description: "One lamp flickers all night and goes out by morning.",
    suggestedFix: "Replace the lamp head or driver.",
    place: "Puchong Jaya main road", agencyId: "tnb", status: "in_progress",
    createdAt: "2026-11-11T19:50:00+08:00", updatedAt: "2026-11-15T09:10:00+08:00", aiSuggested: false,
  }),

  // Air Selangor — no completed ticket yet: dashboard shows "No completed tickets".
  seedTicket({
    id: "D-030", title: "Burst pipe on Jalan Gasing", category: "water", severity: "high",
    description: "Water bubbles up through the road surface near the shop row. Getting worse.",
    suggestedFix: "Isolate the valve and repair the burst main.",
    place: "Jalan Gasing, Petaling Jaya", coords: { lat: 3.112, lng: 101.646 },
    agencyId: "air-selangor", status: "sent", createdAt: "2026-11-18T07:55:00+08:00",
    photo: PHOTO_WATER, aiSuggested: true,
  }),
  // --- 30 more seeds (D-031 to D-060) so the dashboard and inbox feel lived-in.
  // Fixed days keep every median unchanged: MBSJ 2, MBPJ 6, DBKL 4, MBDK 14,
  // MPAJ 9, JKR 3, TNB 1. Air Selangor still has no completed ticket.

  // MBSJ — fixed 1, 2, 3 days.
  fixedTicket({
    id: "D-031", title: "Pothole at USJ 9 traffic light", category: "pothole", severity: "high",
    description: "A pothole right at the stop line. Motorcycles brake into it every red light.",
    suggestedFix: "Patch tonight with cold-mix; full repair at the next road round.",
    place: "USJ 9 junction, Subang Jaya", coords: { lat: 3.042, lng: 101.588 },
    agencyId: "mbsj", createdAt: "2026-10-14T08:30:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 1),
  fixedTicket({
    id: "D-032", title: "Grass overgrown at SS19 roundabout", category: "other", severity: "low",
    description: "Tall grass on the roundabout blocks the view of cars coming round.",
    suggestedFix: "Cut the grass and add the roundabout to the monthly cutting list.",
    place: "SS19 roundabout, Subang Jaya", agencyId: "mbsj",
    createdAt: "2026-10-21T10:05:00+08:00", aiSuggested: false,
  }, 2),
  fixedTicket({
    id: "D-033", title: "Clogged drain outside Puchong Utama school", category: "drain", severity: "medium",
    description: "Leaves and sand fill the drain by the school gate. Parents wait in the puddle.",
    suggestedFix: "Clear the drain and add the stretch to the weekly sweep.",
    place: "Puchong Utama school gate", agencyId: "mbsj",
    createdAt: "2026-10-28T07:15:00+08:00", photo: PHOTO_DRAIN, aiSuggested: true,
  }, 3),
  seedTicket({
    id: "D-034", title: "Broken bench at Taman Wawasan lake", category: "playground", severity: "low",
    description: "A park bench has a snapped slat with a nail sticking out.",
    suggestedFix: "Replace the slat and check the other benches on the path.",
    place: "Taman Wawasan lake, Puchong", agencyId: "mbsj", status: "sent",
    createdAt: "2026-11-18T17:30:00+08:00", photo: PHOTO_PARK, aiSuggested: true,
  }),

  // MBPJ — fixed 5, 6, 6, 7 days.
  fixedTicket({
    id: "D-035", title: "Pothole on Jalan Gasing slip road", category: "pothole", severity: "medium",
    description: "Two potholes on the slip road. Cars brake suddenly to avoid them.",
    suggestedFix: "Patch both holes and check the drainage at the edge.",
    place: "Jalan Gasing slip road, Petaling Jaya", coords: { lat: 3.098, lng: 101.651 },
    agencyId: "mbpj", createdAt: "2026-10-13T09:40:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 5),
  fixedTicket({
    id: "D-036", title: "Rubbish piled at SS2 back lane", category: "rubbish", severity: "medium",
    description: "Restaurant waste bags left in the back lane overnight. Cats tear them open.",
    suggestedFix: "Extra collection and a reminder to shops about bin times.",
    place: "SS2 back lane, Petaling Jaya", agencyId: "mbpj",
    createdAt: "2026-10-17T21:10:00+08:00", photo: PHOTO_DUMP, aiSuggested: false,
  }, 6),
  fixedTicket({
    id: "D-037", title: "Fallen signboard, Damansara Utama", category: "other", severity: "medium",
    description: "A road name sign fell onto the walkway after strong wind.",
    suggestedFix: "Remove the sign from the walkway and re-mount it.",
    place: "Damansara Utama, Petaling Jaya", agencyId: "mbpj",
    createdAt: "2026-10-24T15:25:00+08:00", aiSuggested: true,
  }, 6),
  fixedTicket({
    id: "D-038", title: "Tree roots lifting Section 5 walkway", category: "tree", severity: "low",
    description: "Roots have pushed up the paving blocks. Easy to trip at night.",
    suggestedFix: "Re-lay the paving and trim the roots safely.",
    place: "Section 5 walkway, Petaling Jaya", agencyId: "mbpj",
    createdAt: "2026-10-30T11:50:00+08:00", aiSuggested: false,
  }, 7),
  seedTicket({
    id: "D-039", title: "Water ponding at Kelana Jaya LRT drop-off", category: "flooding", severity: "medium",
    description: "Rain water collects at the drop-off bay. Riders step into it getting out of cars.",
    suggestedFix: "Clear the inlet and re-level the bay surface.",
    place: "Kelana Jaya LRT drop-off, Petaling Jaya", agencyId: "mbpj", status: "in_progress",
    createdAt: "2026-11-12T18:20:00+08:00", updatedAt: "2026-11-16T09:30:00+08:00", aiSuggested: true,
  }),

  // DBKL — fixed 3, 4, 4, 5 days.
  fixedTicket({
    id: "D-040", title: "Pothole on Jalan Tun Razak bus lane", category: "pothole", severity: "high",
    description: "A deep pothole in the bus lane. Buses bounce through it at speed.",
    suggestedFix: "Full-depth patch overnight to avoid the peak hours.",
    place: "Jalan Tun Razak, Kuala Lumpur", coords: { lat: 3.159, lng: 101.718 },
    agencyId: "dbkl", createdAt: "2026-10-19T08:00:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 3),
  fixedTicket({
    id: "D-041", title: "Dumped tyres at Kepong field", category: "dumping", severity: "medium",
    description: "Around twenty old tyres dumped by the football field. Rain water sits inside them.",
    suggestedFix: "Remove the tyres quickly (mosquito risk) and add a camera or sign.",
    place: "Kepong community field, Kuala Lumpur", agencyId: "dbkl",
    createdAt: "2026-10-23T12:40:00+08:00", photo: PHOTO_DUMP, aiSuggested: true,
  }, 4),
  fixedTicket({
    id: "D-042", title: "Broken drain grate, Setapak market", category: "drain", severity: "high",
    description: "A metal grate is missing. The open drain is right where people walk.",
    suggestedFix: "Fit a new grate today and barricade until then.",
    place: "Setapak market, Kuala Lumpur", agencyId: "dbkl",
    createdAt: "2026-10-27T07:35:00+08:00", photo: PHOTO_DRAIN, aiSuggested: false,
  }, 4),
  fixedTicket({
    id: "D-043", title: "Playground fence broken, Titiwangsa", category: "playground", severity: "medium",
    description: "Part of the playground fence is down next to the car park.",
    suggestedFix: "Repair the fence panel so children cannot run onto the road.",
    place: "Taman Tasik Titiwangsa, Kuala Lumpur", agencyId: "dbkl",
    createdAt: "2026-11-01T16:05:00+08:00", photo: PHOTO_PARK, aiSuggested: true,
  }, 5),
  seedTicket({
    id: "D-044", title: "Faded crossing at Jalan Raja Laut", category: "road-markings", severity: "medium",
    description: "The pedestrian crossing near the office towers has almost disappeared.",
    suggestedFix: "Repaint the crossing and the stop line.",
    place: "Jalan Raja Laut, Kuala Lumpur", agencyId: "dbkl", status: "sent",
    createdAt: "2026-11-17T13:10:00+08:00", aiSuggested: true,
  }),
  seedTicket({
    id: "D-045", title: "Rubbish collection missed, Wangsa Maju flats", category: "rubbish", severity: "low",
    description: "The bin centre at the flats has not been cleared since the weekend.",
    suggestedFix: "Send a make-up collection and check the contractor log.",
    place: "Wangsa Maju flats, Kuala Lumpur", agencyId: "dbkl", status: "in_progress",
    createdAt: "2026-11-14T08:25:00+08:00", updatedAt: "2026-11-17T10:00:00+08:00", aiSuggested: false,
  }),

  // MBDK — fixed 13 and 15 days.
  fixedTicket({
    id: "D-046", title: "Streetlights out at Bandar Botanic", category: "streetlight", severity: "medium",
    description: "A row of council lamps along the main road has been dark for a week.",
    suggestedFix: "Check the feeder pillar and replace the failed lamps.",
    place: "Bandar Botanic, Klang", agencyId: "mbdk",
    createdAt: "2026-10-11T20:45:00+08:00", photo: PHOTO_LAMP, aiSuggested: true,
  }, 13),
  fixedTicket({
    id: "D-047", title: "Dumping at Jalan Meru lot", category: "dumping", severity: "medium",
    description: "Household junk and garden waste dumped on an empty lot by the road.",
    suggestedFix: "Clear the lot and put up a no-dumping notice.",
    place: "Jalan Meru, Klang", agencyId: "mbdk",
    createdAt: "2026-10-16T14:15:00+08:00", photo: PHOTO_DUMP, aiSuggested: false,
  }, 15),
  seedTicket({
    id: "D-048", title: "Pothole cluster on Persiaran Raja Muda Musa", category: "pothole", severity: "high",
    description: "Several potholes in a row after the rains. Traffic slows to a crawl.",
    suggestedFix: "Resurface the stretch rather than patch hole by hole.",
    place: "Persiaran Raja Muda Musa, Klang", coords: { lat: 3.035, lng: 101.447 },
    agencyId: "mbdk", status: "sent", createdAt: "2026-11-15T09:05:00+08:00",
    photo: PHOTO_ROAD, aiSuggested: true,
  }),

  // MPAJ — fixed 8 and 10 days.
  fixedTicket({
    id: "D-049", title: "Blocked drain at Taman Cempaka", category: "drain", severity: "medium",
    description: "The drain behind the houses is blocked with sand. Back lane floods when it rains.",
    suggestedFix: "Desilt the drain and clear the outfall.",
    place: "Taman Cempaka, Ampang", agencyId: "mpaj",
    createdAt: "2026-10-22T10:20:00+08:00", photo: PHOTO_DRAIN, aiSuggested: true,
  }, 8),
  fixedTicket({
    id: "D-050", title: "Pothole on Jalan Ampang Hilir", category: "pothole", severity: "medium",
    description: "A pothole near the bus stop fills with water and hides its depth.",
    suggestedFix: "Patch the hole and check the bus-stop drain.",
    place: "Jalan Ampang Hilir, Ampang", agencyId: "mpaj",
    createdAt: "2026-10-26T08:55:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 10),
  seedTicket({
    id: "D-051", title: "Abandoned motorcycle, Pandan Jaya", category: "abandoned-vehicle", severity: "low",
    description: "A motorcycle without plates has been chained to the railing for weeks.",
    suggestedFix: "Notice on the vehicle, then remove if unclaimed.",
    place: "Pandan Jaya shoplots, Ampang", agencyId: "mpaj", status: "in_progress",
    createdAt: "2026-11-10T11:35:00+08:00", updatedAt: "2026-11-14T15:00:00+08:00", aiSuggested: false,
  }),

  // JKR — fixed 2 and 4 days.
  fixedTicket({
    id: "D-052", title: "Pothole on Federal Highway near Subang", category: "pothole", severity: "high",
    description: "A pothole in the fast lane. Drivers swerve at highway speed.",
    suggestedFix: "Close the lane at night and do a full-depth patch.",
    place: "Federal Highway near Subang", coords: { lat: 3.081, lng: 101.556 },
    agencyId: "jkr", createdAt: "2026-10-25T06:40:00+08:00", photo: PHOTO_ROAD, aiSuggested: true,
  }, 2),
  fixedTicket({
    id: "D-053", title: "Damaged guardrail on Jalan Klang Lama", category: "other", severity: "high",
    description: "A guardrail section is bent and loose after a crash. Sharp edge faces the road.",
    suggestedFix: "Replace the guardrail section and add cones until done.",
    place: "Jalan Klang Lama", agencyId: "jkr",
    createdAt: "2026-11-02T22:10:00+08:00", aiSuggested: true,
  }, 4),
  seedTicket({
    id: "D-054", title: "Traffic light stuck on red, Batu Tiga", category: "traffic-light", severity: "medium",
    description: "One direction stays red for several minutes. Drivers start to run it.",
    suggestedFix: "Check the signal timing and the vehicle sensor.",
    place: "Batu Tiga junction, Shah Alam", agencyId: "jkr", status: "in_progress",
    createdAt: "2026-11-13T17:45:00+08:00", updatedAt: "2026-11-15T08:20:00+08:00", aiSuggested: true,
  }),

  // TNB — fixed 1 and 2 days.
  fixedTicket({
    id: "D-055", title: "Streetlight out by SS15 bus stop", category: "streetlight", severity: "medium",
    description: "The lamp over the bus stop is out. Riders wait in the dark.",
    suggestedFix: "Replace the lamp head.",
    place: "SS15 bus stop, Subang Jaya", agencyId: "tnb",
    createdAt: "2026-10-29T19:30:00+08:00", photo: PHOTO_LAMP, aiSuggested: true,
  }, 1),
  fixedTicket({
    id: "D-056", title: "Sparking cable on lamp pole, Kota Damansara", category: "streetlight", severity: "high",
    description: "A cable at the base of a lamp pole sparks after rain. People walk past it.",
    suggestedFix: "Isolate the supply today and replace the cable.",
    place: "Kota Damansara, Petaling Jaya", agencyId: "tnb",
    createdAt: "2026-11-05T21:15:00+08:00", photo: PHOTO_LAMP, aiSuggested: true,
  }, 2),
  seedTicket({
    id: "D-057", title: "Lamps out along Jalan Kuchai Lama", category: "streetlight", severity: "medium",
    description: "Four lamps in a row are out on the stretch by the flats.",
    suggestedFix: "Check the circuit and replace the failed lamps.",
    place: "Jalan Kuchai Lama, Kuala Lumpur", agencyId: "tnb", status: "sent",
    createdAt: "2026-11-18T20:40:00+08:00", photo: PHOTO_LAMP, aiSuggested: false,
  }),

  // Air Selangor — still no completed ticket.
  seedTicket({
    id: "D-058", title: "Leaking pipe at Taman Medan", category: "water", severity: "medium",
    description: "Clean water runs along the roadside from a leak near the meter box.",
    suggestedFix: "Locate and repair the leak; check the meter connection.",
    place: "Taman Medan, Petaling Jaya", agencyId: "air-selangor", status: "in_progress",
    createdAt: "2026-11-11T09:15:00+08:00", updatedAt: "2026-11-14T11:40:00+08:00",
    photo: PHOTO_WATER, aiSuggested: true,
  }),
  seedTicket({
    id: "D-059", title: "Low water pressure, Bandar Sunway", category: "water", severity: "low",
    description: "Taps in the row of shops run weak every morning for a week.",
    suggestedFix: "Check the supply valve and the pressure in the zone.",
    place: "Bandar Sunway shop row", agencyId: "air-selangor", status: "sent",
    createdAt: "2026-11-16T07:50:00+08:00", aiSuggested: false,
  }),

  // MBSJ — one more open sewerage case.
  seedTicket({
    id: "D-060", title: "Manhole cover rattling, Subang Jaya SS14", category: "sewerage", severity: "medium",
    description: "A manhole cover rocks loudly when cars pass. It has shifted out of its frame.",
    suggestedFix: "Reseat or replace the cover and frame.",
    place: "Jalan SS14/1, Subang Jaya", agencyId: "mbsj", status: "sent",
    createdAt: "2026-11-19T08:10:00+08:00", aiSuggested: true,
  }),
];
