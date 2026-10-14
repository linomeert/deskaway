import { describe, expect, it } from "vitest";
import { hasBlockedNight } from "./availability";

describe("hasBlockedNight", () => {
  const checkIn = "2026-11-02";
  const checkOut = "2026-11-05";

  it("is false without blocked nights", () => {
    expect(hasBlockedNight([], checkIn, checkOut)).toBe(false);
  });

  it("ignores a blocked night before check-in", () => {
    expect(hasBlockedNight(["2026-11-01"], checkIn, checkOut)).toBe(false);
  });

  it("catches a blocked night on check-in", () => {
    expect(hasBlockedNight(["2026-11-02"], checkIn, checkOut)).toBe(true);
  });

  it("catches a blocked night inside the range", () => {
    expect(hasBlockedNight(["2026-11-04"], checkIn, checkOut)).toBe(true);
  });

  it("allows a blocked night on check-out (check-out is exclusive)", () => {
    expect(hasBlockedNight(["2026-11-05"], checkIn, checkOut)).toBe(false);
  });

  it("ignores a blocked night after check-out", () => {
    expect(hasBlockedNight(["2026-11-08"], checkIn, checkOut)).toBe(false);
  });
});
