import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const IsoDateSchema = z.iso.date();

export const DateRangeSchema = z.object({
  checkIn: IsoDateSchema,
  checkOut: IsoDateSchema,
});

export type DateRange = z.infer<typeof DateRangeSchema>;

export const WorkspaceTypeSchema = z.enum(["desk", "desk_monitor", "office"]);

export type WorkspaceType = z.infer<typeof WorkspaceTypeSchema>;

const cents = z.number().int().nonnegative();

export const CitySchema = z.enum([
  "Ghent",
  "Antwerp",
  "Brussels",
  "Leuven",
  "Bruges",
  "Amsterdam",
  "Utrecht",
  "Rotterdam",
  "Luxembourg City",
  "Durbuy",
  "La Roche-en-Ardenne",
]);

export type City = z.infer<typeof CitySchema>;

export const CountrySchema = z.enum(["BE", "NL", "LU"]);

export type Country = z.infer<typeof CountrySchema>;

export const CITY_COUNTRY: Record<City, Country> = {
  Ghent: "BE",
  Antwerp: "BE",
  Brussels: "BE",
  Leuven: "BE",
  Bruges: "BE",
  Amsterdam: "NL",
  Utrecht: "NL",
  Rotterdam: "NL",
  "Luxembourg City": "LU",
  Durbuy: "BE",
  "La Roche-en-Ardenne": "BE",
};

export const PhotoSchema = z.object({
  url: z.url(),
  alt: z.string().min(1),
});

export type Photo = z.infer<typeof PhotoSchema>;

export const StaySchema = z.object({
  id: z.string(),
  pricePerNight: cents,
  cleaningFee: cents,
  cityTaxPerPersonPerNight: cents,
  minNights: z.number().int().min(1).default(3),
  maxGuests: z.number().int().min(1),
  wifiDownloadMbps: z.number().nonnegative(),
  workspaceType: WorkspaceTypeSchema,
  // Missing = no coworking nearby.
  coworkingDistanceM: z.number().nonnegative().optional(),
});

export type Stay = z.infer<typeof StaySchema>;

// A stay as guests see it: the bookable terms above plus what the listing shows.
export const StayListingSchema = StaySchema.extend({
  name: z.string().min(1),
  city: CitySchema,
  country: CountrySchema,
  description: z.string().min(1),
  photos: z.array(PhotoSchema).min(1),
  // Upload matters for video calls; shown next to download.
  wifiUploadMbps: z.number().nonnegative(),
  wifiMeasuredAt: IsoDateSchema,
});

export type StayListing = z.infer<typeof StayListingSchema>;

const rating = z.number().int().min(1).max(5);

export const ReviewSchema = z.object({
  id: z.string(),
  stayId: z.string(),
  authorName: z.string().min(1),
  createdAt: IsoDateSchema,
  rating,
  wifiRating: rating,
  workspaceRating: rating,
  // 1 = very noisy, 5 = very quiet.
  noiseRating: rating,
  text: z.string().min(1),
});

export type Review = z.infer<typeof ReviewSchema>;

export const QuoteRequestSchema = DateRangeSchema.extend({
  stayId: z.string(),
  guests: z.number().int().min(1),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const PriceLineSchema = z.object({
  kind: z.enum(["nights", "cleaningFee", "cityTax"]),
  amount: cents,
});

export type PriceLine = z.infer<typeof PriceLineSchema>;

export const QuoteSchema = z.union([
  z.object({
    available: z.literal(true),
    nights: z.number().int().positive(),
    lines: z.array(PriceLineSchema),
    total: cents,
  }),
  z.object({
    available: z.literal(false),
    reason: z.literal("INVALID_DATES"),
  }),
  z.object({
    available: z.literal(false),
    reason: z.literal("MIN_NIGHTS"),
    minNights: z.number().int(),
  }),
  z.object({
    available: z.literal(false),
    reason: z.literal("MAX_GUESTS"),
    maxGuests: z.number().int(),
  }),
]);

export type Quote = z.infer<typeof QuoteSchema>;

const guests = z.number().int().min(1);

export const BookingCreateSchema = DateRangeSchema.extend({
  stayId: z.string(),
  guests,
  guestName: z.string().trim().min(1).max(100),
  guestEmail: z.email(),
  // Optional, for people who expense the stay.
  company: z.string().trim().min(1).max(100).optional(),
  vatNumber: z.string().trim().min(1).max(20).optional(),
  note: z.string().trim().min(1).max(500).optional(),
});

export type BookingCreate = z.infer<typeof BookingCreateSchema>;

// Prices on a booking are always computed by the server with quote().
export const BookingSchema = BookingCreateSchema.extend({
  id: z.string(),
  nights: z.number().int().positive(),
  lines: z.array(PriceLineSchema),
  total: cents,
  createdAt: IsoDateSchema,
});

export type Booking = z.infer<typeof BookingSchema>;

export const ReviewCreateSchema = ReviewSchema.pick({
  rating: true,
  wifiRating: true,
  workspaceRating: true,
  noiseRating: true,
}).extend({
  authorName: z.string().trim().min(1).max(60),
  text: z.string().trim().min(20).max(1000),
});

export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;

const average = z.number().min(1).max(5).nullable();

export const ReviewSummarySchema = z.object({
  count: z.number().int().nonnegative(),
  // null when there are no reviews.
  rating: average,
  wifiRating: average,
  workspaceRating: average,
  noiseRating: average,
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

const workScoreValue = z.number().int().min(0).max(100);

export const StaySummarySchema = StayListingSchema.extend({
  workScore: workScoreValue,
  averageRating: average,
  reviewCount: z.number().int().nonnegative(),
  // Only present when the search had dates.
  quote: QuoteSchema.optional(),
});

export type StaySummary = z.infer<typeof StaySummarySchema>;

export const StayDetailSchema = StayListingSchema.extend({
  workScore: workScoreValue,
  reviewSummary: ReviewSummarySchema,
});

export type StayDetail = z.infer<typeof StayDetailSchema>;

export const StayPageSchema = z.object({
  items: z.array(StaySummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});

export type StayPage = z.infer<typeof StayPageSchema>;

// Query strings arrive as text, so numbers are coerced.
const queryInt = z.coerce.number().int();

export const StaySortSchema = z.enum([
  "workScore",
  "priceAsc",
  "priceDesc",
  "rating",
]);

export type StaySort = z.infer<typeof StaySortSchema>;

export const StaySearchQuerySchema = z
  .object({
    city: CitySchema.optional(),
    checkIn: IsoDateSchema.optional(),
    checkOut: IsoDateSchema.optional(),
    guests: queryInt.min(1).default(1),
    minWifi: z.coerce.number().nonnegative().optional(),
    workspace: WorkspaceTypeSchema.optional(),
    sort: StaySortSchema.default("workScore"),
    page: queryInt.min(1).default(1),
  })
  .refine(
    (query) => (query.checkIn === undefined) === (query.checkOut === undefined),
    {
      message: "checkIn and checkOut go together",
      path: ["checkOut"],
    },
  );

export type StaySearchQuery = z.infer<typeof StaySearchQuerySchema>;

export const QuoteQuerySchema = DateRangeSchema.extend({
  guests: queryInt.min(1),
});

export type QuoteQuery = z.infer<typeof QuoteQuerySchema>;

const MAX_AVAILABILITY_DAYS = 366;

export const AvailabilityQuerySchema = z
  .object({ from: IsoDateSchema, to: IsoDateSchema })
  .refine((range) => range.from < range.to, {
    message: "to must be after from",
    path: ["to"],
  })
  .refine(
    (range) =>
      Date.parse(range.to) - Date.parse(range.from) <=
      MAX_AVAILABILITY_DAYS * 86_400_000,
    {
      message: `range can be at most ${String(MAX_AVAILABILITY_DAYS)} days`,
      path: ["to"],
    },
  );

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;

export const AvailabilitySchema = z.object({
  blocked: z.array(IsoDateSchema),
});

export type Availability = z.infer<typeof AvailabilitySchema>;

export const ReviewSortSchema = z.enum(["recent", "rating"]);

export type ReviewSort = z.infer<typeof ReviewSortSchema>;

export const ReviewsQuerySchema = z.object({
  sort: ReviewSortSchema.default("recent"),
});

export const IdParamsSchema = z.object({ id: z.string().min(1) });

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
