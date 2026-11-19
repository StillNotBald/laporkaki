// Category labels and body suggestion (CONTRACT §2, routing table v1 in
// research/03-routing.md). A suggestion, never a decision: the place-based
// council stays the default and every field is editable.

import type { Category } from "@/lib/store/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  pothole: "Pothole",
  streetlight: "Broken streetlight",
  drain: "Blocked drain",
  rubbish: "Rubbish not collected",
  dumping: "Illegal dumping",
  tree: "Fallen tree",
  "road-markings": "Faded road markings",
  playground: "Broken playground",
  flooding: "Flooding",
  "abandoned-vehicle": "Abandoned vehicle",
  "traffic-light": "Broken traffic light",
  water: "Water leak or no water",
  sewerage: "Sewerage overflow",
  other: "Other problem",
};

/**
 * Suggest a body for a category. Only three categories override the
 * place-based council: streetlight → TNB, water → Air Selangor,
 * traffic-light → JKR. Sewerage belongs to IWK, which is not one of our
 * eight bodies, so it keeps the current selection (never air-selangor).
 * Everything else keeps the place-based council. Always editable.
 */
export function suggestAgency(category: Category, currentId: string): string {
  switch (category) {
    case "streetlight":
      return "tnb";
    case "water":
      return "air-selangor";
    case "traffic-light":
      return "jkr";
    default:
      return currentId;
  }
}