// The eight bodies LaporKaki routes to (CONTRACT §2).
// Names and areas from research/03-routing.md §1. Suggestion only —
// the citizen and the demo officer can always change the body.

import type { Agency } from "@/lib/store/types";

export const AGENCIES: Agency[] = [
  {
    id: "mbsj",
    short: "MBSJ",
    name: "Majlis Bandaraya Subang Jaya",
    area: "Subang Jaya, Puchong, Seri Kembangan",
    kind: "council",
  },
  {
    id: "mbpj",
    short: "MBPJ",
    name: "Majlis Bandaraya Petaling Jaya",
    area: "Petaling Jaya",
    kind: "council",
  },
  {
    id: "dbkl",
    short: "DBKL",
    name: "Dewan Bandaraya Kuala Lumpur",
    area: "Kuala Lumpur",
    kind: "council",
  },
  {
    id: "mbdk",
    short: "MBDK",
    name: "Majlis Bandaraya Diraja Klang",
    area: "Klang, Port Klang",
    kind: "council",
  },
  {
    id: "mpaj",
    short: "MPAJ",
    name: "Majlis Perbandaran Ampang Jaya",
    area: "Ampang, Pandan",
    kind: "council",
  },
  {
    id: "jkr",
    short: "JKR",
    name: "Jabatan Kerja Raya",
    area: "Federal and state roads",
    kind: "works",
  },
  {
    id: "tnb",
    short: "TNB",
    name: "Tenaga Nasional Berhad",
    area: "TNB-owned streetlights and power supply",
    kind: "utility",
  },
  {
    id: "air-selangor",
    short: "Air Selangor",
    name: "Air Selangor",
    area: "Water supply in KL and Selangor",
    kind: "utility",
  },
];

export const DEFAULT_AGENCY_ID = "mbsj";

export function agencyById(id: string): Agency | undefined {
  return AGENCIES.find((a) => a.id === id);
}