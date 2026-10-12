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

export const ReviewSchema = z.object({
  // 1 = very noisy, 5 = very quiet.
  noiseRating: z.number().int().min(1).max(5),
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
