import { ReviewSchema } from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { buildApp } from "../app";
import { errorOf } from "../test/errorOf";

const TODAY = "2026-10-12";
const url = "/api/stays/leuven-vaartkom-apartment/reviews";

const review = {
  authorName: "Grace H.",
  rating: 4,
  wifiRating: 5,
  workspaceRating: 4,
  noiseRating: 3,
  text: "Solid wifi and a good monitor desk, a bit of street noise.",
};

describe("review routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ today: () => TODAY });
  });

  afterEach(async () => {
    await app.close();
  });

  it("adds a review that then shows up first", async () => {
    const created = await app.inject({ method: "POST", url, payload: review });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual(
      expect.objectContaining({ ...review, createdAt: TODAY }),
    );

    const list = await app.inject({ url });
    const reviews = z.array(ReviewSchema).parse(list.json());
    expect(reviews.map((item) => item.text)).toEqual([review.text]);
  });

  it("rejects a banned word with 422 REVIEW_REJECTED", async () => {
    const response = await app.inject({
      method: "POST",
      url,
      payload: { ...review, text: "Total scam, the wifi never worked." },
    });

    expect(response.statusCode).toBe(422);
    expect(errorOf(response)).toEqual(
      expect.objectContaining({ code: "REVIEW_REJECTED" }),
    );
  });

  it("rejects a text that is too short with 400", async () => {
    const response = await app.inject({
      method: "POST",
      url,
      payload: { ...review, text: "Nice." },
    });

    expect(response.statusCode).toBe(400);
    expect(errorOf(response)).toEqual(
      expect.objectContaining({ code: "VALIDATION_ERROR" }),
    );
  });

  it("sorts reviews by rating", async () => {
    const response = await app.inject({
      url: "/api/stays/brussels-sainte-catherine-studio/reviews?sort=rating",
    });

    const ratings = z
      .array(ReviewSchema)
      .parse(response.json())
      .map((item) => item.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it("returns 404 for reviews of an unknown stay", async () => {
    const response = await app.inject({ url: "/api/stays/nope/reviews" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Stay nope not found" },
    });
  });
});
