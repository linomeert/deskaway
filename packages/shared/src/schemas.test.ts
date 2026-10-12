import { assert, describe, expect, it } from "vitest";
import {
  HealthResponseSchema,
  QuoteRequestSchema,
  QuoteSchema,
  StaySchema,
} from "./schemas";

describe("HealthResponseSchema", () => {
  it("accepts a healthy response", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      version: "1.2.3",
    });
    expect(result.success).toBe(true);
  });

  it("rejects any status other than ok", () => {
    const result = HealthResponseSchema.safeParse({
      status: "down",
      version: "1.2.3",
    });
    expect(result.success).toBe(false);
  });
});

describe("QuoteRequestSchema", () => {
  const request = {
    stayId: "stay-1",
    checkIn: "2026-11-02",
    checkOut: "2026-11-05",
    guests: 1,
  };

  it("accepts 1 guest", () => {
    const result = QuoteRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("rejects 0 guests", () => {
    const result = QuoteRequestSchema.safeParse({ ...request, guests: 0 });
    expect(result.success).toBe(false);
  });
});

describe("StaySchema", () => {
  const stay = {
    id: "stay-1",
    pricePerNight: 8000,
    cleaningFee: 4500,
    cityTaxPerPersonPerNight: 250,
    maxGuests: 2,
    wifiDownloadMbps: 100,
    workspaceType: "desk",
  };

  it("defaults minNights to 3", () => {
    const result = StaySchema.safeParse(stay);

    assert(result.success);
    expect(result.data.minNights).toBe(3);
  });

  it("keeps an explicit minNights", () => {
    const result = StaySchema.safeParse({ ...stay, minNights: 7 });

    assert(result.success);
    expect(result.data.minNights).toBe(7);
  });
});

describe("QuoteSchema", () => {
  it("accepts an available quote with lines and a total", () => {
    const result = QuoteSchema.safeParse({
      available: true,
      nights: 3,
      lines: [
        { kind: "nights", amount: 3 * 8000 },
        { kind: "cleaningFee", amount: 4500 },
        { kind: "cityTax", amount: 3 * 250 },
      ],
      total: 3 * 8000 + 4500 + 3 * 250,
    });
    expect(result.success).toBe(true);
  });

  it("accepts each unavailable reason with its detail", () => {
    const quotes = [
      { available: false, reason: "INVALID_DATES" },
      { available: false, reason: "MIN_NIGHTS", minNights: 3 },
      { available: false, reason: "MAX_GUESTS", maxGuests: 2 },
    ];

    for (const quote of quotes) {
      expect(QuoteSchema.safeParse(quote).success).toBe(true);
    }
  });

  it("rejects MIN_NIGHTS without the minNights number", () => {
    const result = QuoteSchema.safeParse({
      available: false,
      reason: "MIN_NIGHTS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown reason code", () => {
    const result = QuoteSchema.safeParse({
      available: false,
      reason: "SOLD_OUT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer amount in cents", () => {
    const result = QuoteSchema.safeParse({
      available: true,
      nights: 3,
      lines: [{ kind: "nights", amount: 240.5 }],
      total: 240.5,
    });
    expect(result.success).toBe(false);
  });
});
