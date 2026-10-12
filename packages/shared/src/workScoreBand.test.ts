import { describe, expect, it } from "vitest";
import { type WorkScoreBand, workScoreBand } from "./workScore";

const cases: [number, WorkScoreBand][] = [
  [100, "excellent"],
  [80, "excellent"],
  [79, "good"],
  [60, "good"],
  [59, "fair"],
  [0, "fair"],
];

describe("workScoreBand", () => {
  it.each(cases)("puts %i in the %s band", (score, band) => {
    expect(workScoreBand(score)).toBe(band);
  });
});
