import { describe, expect, it } from "vitest";
import { moderateReview, summarizeReviews } from "./reviews";

describe("summarizeReviews", () => {
  it("returns nulls when there are no reviews", () => {
    expect(summarizeReviews([])).toEqual({
      count: 0,
      rating: null,
      wifiRating: null,
      workspaceRating: null,
      noiseRating: null,
    });
  });

  it("averages each rating to one decimal", () => {
    const summary = summarizeReviews([
      { rating: 5, wifiRating: 4, workspaceRating: 3, noiseRating: 1 },
      { rating: 4, wifiRating: 4, workspaceRating: 3, noiseRating: 2 },
      { rating: 4, wifiRating: 5, workspaceRating: 3, noiseRating: 2 },
    ]);

    expect(summary).toEqual({
      count: 3,
      rating: 4.3,
      wifiRating: 4.3,
      workspaceRating: 3,
      noiseRating: 1.7,
    });
  });
});

describe("moderateReview", () => {
  it("accepts a normal review", () => {
    expect(moderateReview("Fast wifi and a quiet street.")).toEqual({
      ok: true,
    });
  });

  it("rejects a banned word in any case", () => {
    expect(moderateReview("This place is a SCAM!")).toEqual({
      ok: false,
      word: "scam",
    });
  });

  it("only matches whole words", () => {
    expect(moderateReview("Scampi for lunch, shitake for dinner")).toEqual({
      ok: true,
    });
  });
});
