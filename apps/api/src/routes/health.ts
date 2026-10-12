import type { HealthResponse } from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import pkg from "../../package.json" with { type: "json" };

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get<{ Reply: HealthResponse }>("/api/health", () => ({
    status: "ok",
    version: pkg.version,
  }));
}
