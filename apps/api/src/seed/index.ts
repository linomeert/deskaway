import {
  BookingCreateSchema,
  ReviewSchema,
  StayListingSchema,
  addDays,
  quote,
  type Booking,
  type Review,
  type StayListing,
} from "@deskaway/shared";
import { z } from "zod";
import bookingsJson from "./bookings.json" with { type: "json" };
import reviewsJson from "./reviews.json" with { type: "json" };
import staysJson from "./stays.json" with { type: "json" };

// Seed files store day offsets instead of dates, so the demo never goes stale.
export const SeedStaySchema = StayListingSchema.omit({
  wifiMeasuredAt: true,
}).extend({
  wifiMeasuredDaysAgo: z.number().int().min(0).max(60),
});

export const SeedBookingSchema = BookingCreateSchema.omit({
  checkIn: true,
  checkOut: true,
}).extend({
  id: z.string(),
  // 0 = check-in today.
  checkInInDays: z.number().int().nonnegative(),
  nights: z.number().int().positive(),
});

export interface Seed {
  stays: StayListing[];
  reviews: Review[];
  bookings: Booking[];
}

// `today` is an ISO date, passed in so the result is deterministic in tests.
// Seed bookings are priced with quote(), like bookings made through the API.
export function loadSeed(today: string): Seed {
  const stays = z
    .array(SeedStaySchema)
    .parse(staysJson)
    .map(({ wifiMeasuredDaysAgo, ...stay }): StayListing => ({
      ...stay,
      wifiMeasuredAt: addDays(today, -wifiMeasuredDaysAgo),
    }));

  const bookings = z
    .array(SeedBookingSchema)
    .parse(bookingsJson)
    .map(({ checkInInDays, nights, ...booking }): Booking => {
      const checkIn = addDays(today, checkInInDays);
      const checkOut = addDays(today, checkInInDays + nights);
      const stay = stays.find(({ id }) => id === booking.stayId);
      const price = stay && quote(stay, checkIn, checkOut, booking.guests);
      if (!price?.available) {
        throw new Error(`Seed booking ${booking.id} cannot be priced`);
      }
      return {
        ...booking,
        checkIn,
        checkOut,
        nights: price.nights,
        lines: price.lines,
        total: price.total,
        createdAt: today,
      };
    });

  return {
    stays,
    reviews: z.array(ReviewSchema).parse(reviewsJson),
    bookings,
  };
}
