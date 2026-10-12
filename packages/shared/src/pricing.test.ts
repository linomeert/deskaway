import { assert, describe, expect, it } from "vitest";
import { quote } from "./pricing";

const stay = {
  pricePerNight: 8000,
  cleaningFee: 4500,
  cityTaxPerPersonPerNight: 250,
  minNights: 3,
  maxGuests: 2,
};

describe("quote", () => {
  it("prices 3 nights for 1 guest as nights + cleaning fee + city tax", () => {
    const result = quote(stay, "2026-11-02", "2026-11-05", 1);

    expect(result).toMatchObject({
      available: true,
      nights: 3,
      total: 3 * 8000 + 4500 + 3 * 250,
    });
  });

  it("charges city tax per guest per night", () => {
    const result = quote(stay, "2026-11-02", "2026-11-05", 2);

    expect(result).toMatchObject({
      available: true,
      nights: 3,
      total: 3 * 8000 + 4500 + 2 * 3 * 250,
    });
  });

  it("returns exactly three lines that add up to the total", () => {
    const result = quote(stay, "2026-11-02", "2026-11-05", 2);

    assert(result.available);
    expect(result.lines).toEqual([
      { kind: "nights", amount: 3 * 8000 },
      { kind: "cleaningFee", amount: 4500 },
      { kind: "cityTax", amount: 2 * 3 * 250 },
    ]);
    const sum = result.lines.reduce((acc, line) => acc + line.amount, 0);
    expect(sum).toBe(result.total);
  });

  it("is unavailable below the minimum stay", () => {
    const result = quote(stay, "2026-11-02", "2026-11-04", 1);

    expect(result).toEqual({
      available: false,
      reason: "MIN_NIGHTS",
      minNights: 3,
    });
  });

  it("is unavailable above the guest limit", () => {
    const result = quote(stay, "2026-11-02", "2026-11-05", 3);

    expect(result).toEqual({
      available: false,
      reason: "MAX_GUESTS",
      maxGuests: 2,
    });
  });

  it("reports MIN_NIGHTS before MAX_GUESTS when both rules are broken", () => {
    const result = quote(stay, "2026-11-02", "2026-11-04", 3);

    expect(result).toEqual({
      available: false,
      reason: "MIN_NIGHTS",
      minNights: 3,
    });
  });

  it("is unavailable when check-out equals check-in", () => {
    const result = quote(stay, "2026-11-02", "2026-11-02", 1);

    expect(result).toEqual({ available: false, reason: "INVALID_DATES" });
  });

  it("is unavailable when check-out is before check-in", () => {
    const result = quote(stay, "2026-11-05", "2026-11-02", 1);

    expect(result).toEqual({ available: false, reason: "INVALID_DATES" });
  });

  it("treats check-out as exclusive: 2 to 5 Nov is 3 nights, not 4", () => {
    const result = quote(stay, "2026-11-02", "2026-11-05", 1);

    assert(result.available);
    expect(result.nights).toBe(3);
    expect(result.lines[0]).toEqual({ kind: "nights", amount: 3 * 8000 });
  });

  it("counts nights across a month boundary", () => {
    const result = quote(stay, "2026-11-28", "2026-12-02", 1);

    expect(result).toMatchObject({
      available: true,
      nights: 4,
      total: 4 * 8000 + 4500 + 4 * 250,
    });
  });

  it("counts nights across the end of daylight saving time (25 Oct 2026)", () => {
    const result = quote(stay, "2026-10-24", "2026-10-27", 1);

    expect(result).toMatchObject({
      available: true,
      nights: 3,
      total: 3 * 8000 + 4500 + 3 * 250,
    });
  });
});
