import { describe, expect, it } from "vitest";
import type { Stay } from "./schemas";
import { workScore } from "./workScore";

type ScoredStay = Pick<
  Stay,
  "wifiDownloadMbps" | "workspaceType" | "coworkingDistanceM"
>;

// Lowest possible stay: no wifi, plain desk (15), no coworking nearby.
const lowest: ScoredStay = {
  wifiDownloadMbps: 0,
  workspaceType: "desk",
};
const loudest = [{ noiseRating: 1 }];
const quietest = [{ noiseRating: 5 }];

describe("workScore", () => {
  it("scores the best possible stay 100", () => {
    const stay: ScoredStay = {
      wifiDownloadMbps: 100,
      workspaceType: "office",
      coworkingDistanceM: 0,
    };

    expect(workScore(stay, quietest)).toBe(40 + 25 + 20 + 15);
  });

  it("scores the lowest possible stay 15 (a desk is the minimum workspace)", () => {
    expect(workScore(lowest, loudest)).toBe(15);
  });

  it("weights wifi at 40", () => {
    expect(workScore({ ...lowest, wifiDownloadMbps: 100 }, loudest)).toBe(
      40 + 15,
    );
  });

  it("scores workspace types: office 25, desk_monitor 20, desk 15", () => {
    expect(workScore({ ...lowest, workspaceType: "office" }, loudest)).toBe(25);
    expect(
      workScore({ ...lowest, workspaceType: "desk_monitor" }, loudest),
    ).toBe(20);
    expect(workScore({ ...lowest, workspaceType: "desk" }, loudest)).toBe(15);
  });

  it("weights quiet reviews at 20", () => {
    expect(workScore(lowest, quietest)).toBe(20 + 15);
  });

  it("weights coworking next door at 15", () => {
    expect(workScore({ ...lowest, coworkingDistanceM: 0 }, loudest)).toBe(
      15 + 15,
    );
  });

  it("scales wifi linearly and caps it at 100 Mbps", () => {
    expect(workScore({ ...lowest, wifiDownloadMbps: 50 }, loudest)).toBe(
      40 * (50 / 100) + 15,
    );
    expect(workScore({ ...lowest, wifiDownloadMbps: 300 }, loudest)).toBe(
      40 + 15,
    );
  });

  it("averages the noise rating over all reviews", () => {
    const reviews = [{ noiseRating: 5 }, { noiseRating: 1 }];

    expect(workScore(lowest, reviews)).toBe(20 * ((3 - 1) / 4) + 15);
  });

  it("gives half the noise points when there are no reviews", () => {
    expect(workScore(lowest, [])).toBe(20 * 0.5 + 15);
  });

  it("scales coworking distance linearly and gives 0 from 5 km", () => {
    expect(workScore({ ...lowest, coworkingDistanceM: 2500 }, loudest)).toBe(
      Math.round(15 * 0.5 + 15),
    );
    expect(workScore({ ...lowest, coworkingDistanceM: 12000 }, loudest)).toBe(
      15,
    );
  });

  it("gives 0 coworking points when there is no coworking nearby", () => {
    const stay: ScoredStay = {
      wifiDownloadMbps: 100,
      workspaceType: "office",
    };

    expect(workScore(stay, quietest)).toBe(40 + 25 + 20);
  });
});
