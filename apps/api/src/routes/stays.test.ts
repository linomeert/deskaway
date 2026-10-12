import {
  QuoteSchema,
  StayDetailSchema,
  StayPageSchema,
} from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { errorOf } from "../test/errorOf";

// Seed bookings are generated relative to this date.
const TODAY = "2026-10-12";

describe("stay routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ today: () => TODAY });
  });

  afterEach(async () => {
    await app.close();
  });

  async function search(query: string) {
    const response = await app.inject({ url: `/api/stays?${query}` });
    expect(response.statusCode).toBe(200);
    return StayPageSchema.parse(response.json());
  }

  describe("GET /api/stays", () => {
    it("filters by city", async () => {
      const page = await search("city=Amsterdam");

      expect(page.total).toBe(2);
      expect(page.items.map((stay) => stay.city)).toEqual([
        "Amsterdam",
        "Amsterdam",
      ]);
    });

    it("filters by minimum wifi speed and includes the work score", async () => {
      const page = await search("minWifi=300");

      expect(page.total).toBe(5);
      for (const stay of page.items) {
        expect(stay.wifiDownloadMbps).toBeGreaterThanOrEqual(300);
        expect(stay.workScore).toBeGreaterThan(0);
      }
    });

    it("combines city and minimum wifi", async () => {
      const page = await search("city=Amsterdam&minWifi=400");

      expect(page.items.map((stay) => stay.id)).toEqual([
        "amsterdam-jordaan-apartment",
      ]);
    });

    it("hides stays that are booked for the dates and quotes the rest", async () => {
      const page = await search(
        "city=Amsterdam&checkIn=2026-11-01&checkOut=2026-11-05&guests=2",
      );

      expect(page.items.map((stay) => stay.id)).toEqual([
        "amsterdam-noord-loft",
      ]);
      expect(page.items[0]?.quote).toEqual(
        expect.objectContaining({ available: true, nights: 4 }),
      );
    });

    it("rejects a check-in without a check-out", async () => {
      const response = await app.inject({
        url: "/api/stays?checkIn=2026-11-01",
      });

      expect(response.statusCode).toBe(400);
      expect(errorOf(response)).toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });
  });

  describe("GET /api/stays/:id", () => {
    it("returns the stay with a review summary", async () => {
      const response = await app.inject({
        url: "/api/stays/leuven-vaartkom-apartment",
      });

      expect(response.statusCode).toBe(200);
      const stay = StayDetailSchema.parse(response.json());
      expect(stay.reviewSummary).toEqual(
        expect.objectContaining({ count: 0, rating: null }),
      );
    });

    it("returns 404 with the error shape for an unknown id", async () => {
      const response = await app.inject({ url: "/api/stays/nope" });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: { code: "NOT_FOUND", message: "Stay nope not found" },
      });
    });
  });

  describe("GET /api/stays/:id/quote", () => {
    it("returns nights, cleaning fee and city tax lines", async () => {
      // 75 EUR/night, 30 EUR cleaning, 3 EUR city tax per person per night.
      const response = await app.inject({
        url: "/api/stays/ghent-dok-noord-studio/quote?checkIn=2026-11-02&checkOut=2026-11-05&guests=1",
      });

      expect(response.statusCode).toBe(200);
      expect(QuoteSchema.parse(response.json())).toEqual({
        available: true,
        nights: 3,
        lines: [
          { kind: "nights", amount: 3 * 7500 },
          { kind: "cleaningFee", amount: 3000 },
          { kind: "cityTax", amount: 3 * 300 },
        ],
        total: 3 * 7500 + 3000 + 3 * 300,
      });
    });

    it("returns available false with a reason when a rule is broken", async () => {
      const response = await app.inject({
        url: "/api/stays/la-roche-ourthe-chalet/quote?checkIn=2026-11-02&checkOut=2026-11-05&guests=2",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        available: false,
        reason: "MIN_NIGHTS",
        minNights: 7,
      });
    });

    it("rejects a check-in in the past with 422", async () => {
      const response = await app.inject({
        url: "/api/stays/ghent-dok-noord-studio/quote?checkIn=2026-10-11&checkOut=2026-10-15&guests=1",
      });

      expect(response.statusCode).toBe(422);
      expect(errorOf(response)).toEqual(
        expect.objectContaining({ code: "CHECK_IN_IN_PAST" }),
      );
    });
  });

  describe("GET /api/stays/:id/availability", () => {
    it("lists the taken nights in the range", async () => {
      // Seed booking-04: check-in today + 5, 4 nights.
      const response = await app.inject({
        url: "/api/stays/ghent-patershol-loft/availability?from=2026-10-16&to=2026-10-23",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        blocked: ["2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20"],
      });
    });

    it("rejects a range that ends before it starts", async () => {
      const response = await app.inject({
        url: "/api/stays/ghent-patershol-loft/availability?from=2026-10-20&to=2026-10-16",
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
