import type {
  ErrorResponse,
  Quote,
  StayDetail,
  StayListing,
  StayPage,
  StaySummary,
} from "@deskaway/shared";

// Typed by the shared schemas, so a schema change breaks the fixtures loudly.

const listing: StayListing = {
  id: "stay-1",
  name: "Canal loft with a standing desk",
  city: "Ghent",
  country: "BE",
  description: "A quiet loft on the Leie with a dedicated workspace.",
  photos: [
    { url: "https://example.com/loft.jpg", alt: "Loft with a standing desk" },
  ],
  pricePerNight: 12_000,
  cleaningFee: 4_000,
  cityTaxPerPersonPerNight: 300,
  minNights: 3,
  maxGuests: 2,
  wifiDownloadMbps: 300,
  wifiUploadMbps: 100,
  wifiMeasuredAt: "2026-09-01",
  workspaceType: "desk_monitor",
  coworkingDistanceM: 400,
};

export const stayDetail: StayDetail = {
  ...listing,
  workScore: 88,
  reviewSummary: {
    count: 0,
    rating: null,
    wifiRating: null,
    workspaceRating: null,
    noiseRating: null,
  },
};

export const staySummaries: StaySummary[] = [
  { ...listing, workScore: 88, averageRating: 4.7, reviewCount: 12 },
  {
    ...listing,
    id: "stay-2",
    name: "Studio near Antwerp Central",
    city: "Antwerp",
    workScore: 74,
    averageRating: null,
    reviewCount: 0,
  },
];

export function stayPage(items: StaySummary[]): StayPage {
  return { items, total: items.length, page: 1, pageSize: 12 };
}

export const availableQuote: Quote = {
  available: true,
  nights: 7,
  lines: [
    { kind: "nights", amount: 84_000 },
    { kind: "cleaningFee", amount: 4_000 },
    { kind: "cityTax", amount: 2_100 },
  ],
  total: 90_100,
};

export function apiError(code: string, message: string): ErrorResponse {
  return { error: { code, message } };
}
