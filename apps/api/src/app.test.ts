import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp, type BuildAppOptions } from "./app";
import { errorOf } from "./test/errorOf";
import { createInMemoryStayRepository } from "./repo/inMemoryStayRepository";
import { loadSeed } from "./seed";

const TODAY = "2026-10-12";

describe("app", () => {
  let app: FastifyInstance | undefined;

  async function start(options: BuildAppOptions = {}) {
    app = await buildApp({ today: () => TODAY, ...options });
    return app;
  }

  afterEach(async () => {
    await app?.close();
  });

  it("echoes the x-request-id header, or generates one", async () => {
    const server = await start();

    const given = await server.inject({
      url: "/api/health",
      headers: { "x-request-id": "test-123" },
    });
    const generated = await server.inject({ url: "/api/health" });

    expect(given.headers["x-request-id"]).toBe("test-123");
    expect(generated.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns 500 without leaking details for unexpected errors", async () => {
    const repo = createInMemoryStayRepository(loadSeed(TODAY));
    const server = await start({
      repo: {
        ...repo,
        findStays: () => Promise.reject(new Error("secret database detail")),
      },
    });

    const response = await server.inject({ url: "/api/stays" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  });

  describe("dev tools", () => {
    it("fails a GET on ?_fail=1", async () => {
      const server = await start({ devTools: true });

      const response = await server.inject({ url: "/api/stays?_fail=1" });

      expect(response.statusCode).toBe(500);
      expect(errorOf(response)).toEqual(
        expect.objectContaining({ code: "SIMULATED_FAILURE" }),
      );
    });

    it("delays a GET on ?_delay=ms", async () => {
      const server = await start({ devTools: true });

      const started = performance.now();
      const response = await server.inject({ url: "/api/stays?_delay=100" });

      expect(response.statusCode).toBe(200);
      expect(performance.now() - started).toBeGreaterThanOrEqual(95);
    });

    it("ignores the switches when turned off (production)", async () => {
      const server = await start({ devTools: false });

      const response = await server.inject({ url: "/api/stays?_fail=1" });

      expect(response.statusCode).toBe(200);
    });
  });
});
