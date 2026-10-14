import { describe, expect, it } from "vitest";
import {
  addMonths,
  dayLabel,
  monthGrid,
  monthStart,
  moveFocus,
} from "./calendar";

describe("monthStart and addMonths", () => {
  it("finds the first day of the month", () => {
    expect(monthStart("2026-11-17")).toBe("2026-11-01");
  });

  it("moves across a year boundary", () => {
    expect(addMonths("2026-12-01", 1)).toBe("2027-01-01");
    expect(addMonths("2027-01-01", -1)).toBe("2026-12-01");
  });
});

describe("monthGrid", () => {
  it("starts weeks on Monday and pads with null", () => {
    // 1 November 2026 is a Sunday.
    const weeks = monthGrid("2026-11-01");
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-11-01",
    ]);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });

  it("has 29 days in a leap February", () => {
    const days = monthGrid("2028-02-01").flat().filter(Boolean);
    expect(days).toHaveLength(29);
    expect(days.at(-1)).toBe("2028-02-29");
  });
});

describe("moveFocus", () => {
  it("moves one day with left and right", () => {
    expect(moveFocus("2026-11-30", "ArrowRight")).toBe("2026-12-01");
    expect(moveFocus("2026-12-01", "ArrowLeft")).toBe("2026-11-30");
  });

  it("moves one week with up and down, across a year", () => {
    expect(moveFocus("2026-12-29", "ArrowDown")).toBe("2027-01-05");
    expect(moveFocus("2027-01-05", "ArrowUp")).toBe("2026-12-29");
  });

  it("ignores other keys", () => {
    expect(moveFocus("2026-11-03", "Home")).toBeUndefined();
    expect(moveFocus("2026-11-03", "PageDown")).toBeUndefined();
  });
});

describe("dayLabel", () => {
  it("spells out the date and its status", () => {
    expect(dayLabel("2026-11-03", "available")).toBe(
      "Tuesday 3 November 2026, available",
    );
  });
});
