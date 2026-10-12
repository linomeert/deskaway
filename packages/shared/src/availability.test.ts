import { describe, expect, it } from "vitest";
import { isAvailable, isBookableFrom } from "./availability";

describe("isBookableFrom", () => {
  const today = "2026-11-02";

  it("rejects a check-in before today", () => {
    expect(isBookableFrom("2026-11-01", today)).toBe(false);
  });

  it("accepts a check-in today", () => {
    expect(isBookableFrom("2026-11-02", today)).toBe(true);
  });

  it("accepts a check-in in the future", () => {
    expect(isBookableFrom("2026-11-03", today)).toBe(true);
  });
});

describe("isAvailable", () => {
  const bookings = [{ checkIn: "2026-11-05", checkOut: "2026-11-10" }];

  it("is available when there are no bookings", () => {
    expect(isAvailable([], "2026-11-05", "2026-11-10")).toBe(true);
  });

  it("is unavailable for the exact dates of a booking", () => {
    expect(isAvailable(bookings, "2026-11-05", "2026-11-10")).toBe(false);
  });

  it("is available back-to-back: check-in on a booking's check-out day", () => {
    expect(isAvailable(bookings, "2026-11-10", "2026-11-13")).toBe(true);
  });

  it("is available back-to-back: check-out on a booking's check-in day", () => {
    expect(isAvailable(bookings, "2026-11-01", "2026-11-05")).toBe(true);
  });

  it("is unavailable for a request inside a booking", () => {
    expect(isAvailable(bookings, "2026-11-06", "2026-11-09")).toBe(false);
  });

  it("is unavailable for a request around a booking", () => {
    expect(isAvailable(bookings, "2026-11-03", "2026-11-12")).toBe(false);
  });

  it("is unavailable for a request overlapping only the start of a booking", () => {
    expect(isAvailable(bookings, "2026-11-02", "2026-11-06")).toBe(false);
  });

  it("is unavailable for a request overlapping only the end of a booking", () => {
    expect(isAvailable(bookings, "2026-11-09", "2026-11-12")).toBe(false);
  });

  it("checks every booking, not just the first", () => {
    const twoBookings = [
      { checkIn: "2026-11-05", checkOut: "2026-11-10" },
      { checkIn: "2026-11-20", checkOut: "2026-11-25" },
    ];

    expect(isAvailable(twoBookings, "2026-11-18", "2026-11-22")).toBe(false);
  });
});
