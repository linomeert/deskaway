import { describe, expect, it } from "vitest";
import { addDays, blockedNights } from "./availability";

describe("addDays", () => {
  it("crosses month and DST boundaries by calendar day", () => {
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
});

describe("blockedNights", () => {
  const bookings = [
    { checkIn: "2026-11-02", checkOut: "2026-11-04" },
    { checkIn: "2026-11-04", checkOut: "2026-11-05" },
  ];

  it("lists taken nights and leaves the check-out day free", () => {
    expect(blockedNights(bookings, "2026-11-01", "2026-11-07")).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
    ]);
  });

  it("only looks inside [from, to)", () => {
    expect(blockedNights(bookings, "2026-11-03", "2026-11-04")).toEqual([
      "2026-11-03",
    ]);
  });

  it("is empty without bookings", () => {
    expect(blockedNights([], "2026-11-01", "2026-11-07")).toEqual([]);
  });
});
