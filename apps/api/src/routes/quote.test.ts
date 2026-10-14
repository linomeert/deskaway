import { QuoteSchema } from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";

// Seed bookings are generated relative to this date. Seed booking-04 holds
// ghent-patershol-loft from 2026-10-17 to 2026-10-21 (nights 17-20).
const TODAY = "2026-10-12";

describe("GET /api/stays/:id/quote overlap", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ today: () => TODAY });
  });

  afterEach(async () => {
    await app.close();
  });

  async function quoteFor(checkIn: string, checkOut: string) {
    const response = await app.inject({
      url: `/api/stays/ghent-patershol-loft/quote?checkIn=${checkIn}&checkOut=${checkOut}&guests=1`,
    });
    expect(response.statusCode).toBe(200);
    return QuoteSchema.parse(response.json());
  }

  it("returns DATES_TAKEN when the range overlaps a booking", async () => {
    expect(await quoteFor("2026-10-16", "2026-10-23")).toEqual({
      available: false,
      reason: "DATES_TAKEN",
    });
  });

  it("quotes a stay that checks out on the booking's check-in day", async () => {
    const quote = await quoteFor("2026-10-14", "2026-10-17");
    expect(quote.available).toBe(true);
  });

  it("quotes a stay that checks in on the booking's check-out day", async () => {
    const quote = await quoteFor("2026-10-21", "2026-10-24");
    expect(quote.available).toBe(true);
  });

  it("reports a broken quote rule before the overlap", async () => {
    // Two nights inside the booking: too short and taken; MIN_NIGHTS wins.
    expect(await quoteFor("2026-10-18", "2026-10-20")).toEqual({
      available: false,
      reason: "MIN_NIGHTS",
      minNights: 3,
    });
  });
});
