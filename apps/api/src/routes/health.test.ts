import { HealthResponseSchema } from "@deskaway/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app";

describe("GET /api/health", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns ok with the api version", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    const body = HealthResponseSchema.parse(response.json());
    expect(body.status).toBe("ok");
  });

  it("returns the standard error shape for unknown api routes", async () => {
    const response = await app.inject({ method: "GET", url: "/api/nope" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Route GET /api/nope not found" },
    });
  });
});
