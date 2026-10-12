import { describe, expect, it } from "vitest";
import { todayIn } from "./today";

describe("todayIn", () => {
  it("uses the local date in Brussels, not the UTC date", () => {
    // 23:30 UTC on 11 Oct is 01:30 on 12 Oct in Brussels (CEST).
    const now = new Date("2026-10-11T23:30:00Z");

    expect(todayIn("Europe/Brussels", now)).toBe("2026-10-12");
    expect(todayIn("UTC", now)).toBe("2026-10-11");
  });
});
