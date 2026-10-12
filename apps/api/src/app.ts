import fastifyStatic from "@fastify/static";
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { registerHealthRoutes } from "./routes/health";

export interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  /** When set, serves the built web app from this directory with SPA fallback. */
  webDistDir?: string;
}

function isApiPath(url: string): boolean {
  return url === "/api" || url.startsWith("/api/") || url.startsWith("/api?");
}

function getStatusCode(error: unknown): number {
  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }
  return 500;
}

function getErrorCode(error: unknown): string {
  if (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "BAD_REQUEST";
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<FastifyInstance> {
  const { logger = false, webDistDir } = options;
  const app = Fastify({ logger });

  // All API errors use one shape: { error: { code, message, details? } }.
  app.setErrorHandler((error, request, reply) => {
    const statusCode = getStatusCode(error);
    if (statusCode >= 500) {
      request.log.error(error);
      return reply.status(statusCode).send({
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      });
    }
    return reply.status(statusCode).send({
      error: {
        code: getErrorCode(error),
        message: error instanceof Error ? error.message : "Request failed",
      },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    if (webDistDir && request.method === "GET" && !isApiPath(request.url)) {
      return reply.sendFile("index.html");
    }
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });

  if (webDistDir) {
    await app.register(fastifyStatic, { root: webDistDir });
  }

  registerHealthRoutes(app);

  return app;
}
