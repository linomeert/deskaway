import {
  CITY_COUNTRY,
  PhotoSchema,
  ReviewSchema,
  addDays,
  isAvailable,
  quote,
} from "@deskaway/shared";
import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import bookingsJson from "./bookings.json" with { type: "json" };
import reviewsJson from "./reviews.json" with { type: "json" };
import staysJson from "./stays.json" with { type: "json" };
import {
  SeedBookingSchema,
  SeedStaySchema,
  loadSeed,
  type Seed,
} from "./index";

const TODAY = "2026-10-12";

// Strict variants: a misspelled key in the seed fails instead of being stripped.
const StrictStaySchema = z.strictObject({
  ...SeedStaySchema.shape,
  photos: z.array(z.strictObject(PhotoSchema.shape)).min(1),
});
const StrictReviewSchema = z.strictObject(ReviewSchema.shape);
const StrictSeedBookingSchema = z.strictObject(SeedBookingSchema.shape);

function expectValid(schema: z.ZodType, record: unknown): void {
  const result = schema.safeParse(record);
  expect(
    result.success,
    result.error ? z.prettifyError(result.error) : "",
  ).toBe(true);
}

describe("seed files match the schemas", () => {
  it.each(staysJson)("stay $id", (stay) => {
    expectValid(StrictStaySchema, stay);
  });

  it.each(reviewsJson)("review $id", (review) => {
    expectValid(StrictReviewSchema, review);
  });

  it.each(bookingsJson)("booking $id", (booking) => {
    expectValid(StrictSeedBookingSchema, booking);
  });
});

describe("seed data", () => {
  let stays: Seed["stays"] = [];
  let reviews: Seed["reviews"] = [];
  let bookings: Seed["bookings"] = [];

  // Loaded here, not at collection, so a broken record still gets its own report above.
  beforeAll(() => {
    ({ stays, reviews, bookings } = loadSeed(TODAY));
  });

  it("has unique ids in every file", () => {
    for (const records of [stays, reviews, bookings]) {
      const ids = records.map((record) => record.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references stays that exist", () => {
    const stayIds = new Set(stays.map((stay) => stay.id));
    for (const record of [...reviews, ...bookings]) {
      expect(stayIds).toContain(record.stayId);
    }
  });

  it("gives every stay the country of its city", () => {
    for (const stay of stays) {
      expect(stay.country, stay.id).toBe(CITY_COUNTRY[stay.city]);
    }
  });

  it("has realistic upload speeds", () => {
    for (const stay of stays) {
      expect(stay.wifiUploadMbps, stay.id).toBeGreaterThanOrEqual(5);
      expect(stay.wifiUploadMbps, stay.id).toBeLessThanOrEqual(100);
      expect(stay.wifiUploadMbps, stay.id).toBeLessThanOrEqual(
        stay.wifiDownloadMbps,
      );
    }
  });

  it("measured the wifi within the last 60 days", () => {
    const oldest = addDays(TODAY, -60);
    for (const stay of stays) {
      expect(stay.wifiMeasuredAt >= oldest, stay.id).toBe(true);
      expect(stay.wifiMeasuredAt <= TODAY, stay.id).toBe(true);
    }
  });

  it("uses one city tax per city", () => {
    const taxByCity = new Map<string, number>();
    for (const stay of stays) {
      const tax = taxByCity.get(stay.city) ?? stay.cityTaxPerPersonPerNight;
      expect(stay.cityTaxPerPersonPerNight, stay.id).toBe(tax);
      taxByCity.set(stay.city, tax);
    }
  });

  it("generates booking dates relative to today", () => {
    const first = bookings.find((booking) => booking.id === "booking-01");
    expect(first).toEqual(
      expect.objectContaining({ checkIn: TODAY, checkOut: "2026-10-22" }),
    );
  });

  it("only has bookings that follow the stay's rules", () => {
    for (const booking of bookings) {
      const stay = stays.find(({ id }) => id === booking.stayId);
      if (!stay) throw new Error(`Unknown stay ${booking.stayId}`);
      const result = quote(
        stay,
        booking.checkIn,
        booking.checkOut,
        booking.guests,
      );
      expect(result.available, booking.id).toBe(true);
    }
  });

  it("has no overlapping bookings for the same stay", () => {
    for (const booking of bookings) {
      const others = bookings.filter(
        (other) => other.stayId === booking.stayId && other.id !== booking.id,
      );
      expect(
        isAvailable(others, booking.checkIn, booking.checkOut),
        booking.id,
      ).toBe(true);
    }
  });

  describe("edge cases", () => {
    it("has a stay with zero reviews", () => {
      const reviewed = new Set(reviews.map((review) => review.stayId));
      expect(stays.some((stay) => !reviewed.has(stay.id))).toBe(true);
    });

    it("has a stay that is fully booked for the next 30 days", () => {
      const fullyBooked = stays.filter((stay) => {
        const taken = bookings.filter((booking) => booking.stayId === stay.id);
        return Array.from({ length: 30 }, (_, day) =>
          addDays(TODAY, day),
        ).every((night) => !isAvailable(taken, night, addDays(night, 1)));
      });
      expect(fullyBooked).toHaveLength(1);
    });

    it("has a stay with a 7-night minimum", () => {
      expect(stays.some((stay) => stay.minNights === 7)).toBe(true);
    });
  });
});
