import type { StaySort } from "@deskaway/shared";

// "Wifi 100+" chip value; the filters dialog allows any step.
export const FAST_WIFI_MBPS = 100;

export const WIFI_SLIDER = { min: 0, max: 500, step: 50 };

export const SORT_LABELS: Record<StaySort, string> = {
  workScore: "Work score",
  priceAsc: "Price per day",
  priceDesc: "Price (high to low)",
  rating: "Rating",
};

// Offered in the UI; the others still work from a URL.
export const SORT_CHOICES: StaySort[] = ["workScore", "priceAsc"];
