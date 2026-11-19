// Shared ticket types — exactly docs/CONTRACT.md §1 (owner: worker A).
// Five other workers import these; do not change the shapes.

export type TicketStatus = "sent" | "in_progress" | "fixed";
export type Severity = "low" | "medium" | "high";
export type Category =
  | "pothole" | "streetlight" | "drain" | "rubbish" | "dumping"
  | "tree" | "road-markings" | "playground" | "flooding"
  | "abandoned-vehicle" | "traffic-light" | "water" | "sewerage" | "other";

export interface Agency {
  id: string;        // "mbsj" | "mbpj" | "dbkl" | "mbdk" | "mpaj" | "jkr" | "tnb" | "air-selangor"
  short: string;     // "MBSJ"
  name: string;      // "Majlis Bandaraya Subang Jaya"
  area: string;      // "Subang Jaya, Puchong, Seri Kembangan"
  kind: "council" | "utility" | "works";
}

export interface Ticket {
  id: string;                    // seeds "D-001"…; new "LK-" + base36 timestamp + random
  title: string;
  category: Category;
  severity: Severity;
  description: string;
  suggestedFix: string;          // may be "" — never blocks sending
  place: string;                 // human place label, editable
  coords?: { lat: number; lng: number };
  agencyId: string;
  status: TicketStatus;
  createdAt: string;             // ISO
  updatedAt: string;             // ISO
  fixedAt?: string;              // ISO, set when status becomes fixed
  photo?: string;                // data URL; may be dropped on storage quota
  note?: string;                 // citizen's optional note
  aiSuggested: boolean;          // true when AI filled the fields
}

export interface AgencyStats {
  agency: Agency;
  raised: number;
  solved: number;
  medianDaysToFix: number | null; // null → show "No completed tickets"
}

export interface Draft {          // transient, sessionStorage only, never persisted as a ticket
  photo?: string;
  note?: string;
  place?: string;
  coords?: { lat: number; lng: number };
  agencyId?: string;
}