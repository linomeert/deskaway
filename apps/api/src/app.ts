import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { todayIn } from "@deskaway/shared";
import Fastify, {
  LogController,
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { AppError } from "./errors";
import { createInMemoryStayRepository } from "./repo/inMemoryStayRepository";
import type { StayRepository } from "./repo/StayRepository";
import { registerBookingRoutes } from "./routes/bookings";
import { registerHealthRoutes } from "./routes/health";
import { registerReviewRoutes } from "./routes/reviews";
import { registerStayRoutes } from "./routes/stays";
import { loadSeed } from "./seed";

export interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  /** When set, serves the built web app from this directory with SPA fallback. */
  webDistDir?: string;
  /** Defaults to the in-memory repository loaded from the seed. */
  repo?: StayRepository;
  /** Today's date (YYYY-MM-DD). Defaults to the date in Brussels. */
  today?: () => string;
  /** Enables ?_delay=ms and ?_fail=1 on GET requests. Off in production. */
  devTools?: boolean;
}

const MAX_DEV_DELAY_MS = 10_000;

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
  const {
    logger = false,
    webDistDir,
    today = () => todayIn("Europe/Brussels"),
    devTools = process.env.NODE_ENV !== "production",
  } = options;
  const repo = options.repo ?? createInMemoryStayRepository(loadSeed(today()));

  const app = Fastify({
    logger,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
    // Replaced by one log line per request in the onResponse hook below.
    logController: new LogController({ disableRequestLogging: true }),
    // Render puts a proxy in front, so the rate limit needs the client IP.
    trustProxy: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.addHook("onSend", (request, reply, payload, done) => {
    void reply.header("x-request-id", request.id);
    done(null, payload);
  });

  app.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: Math.round(reply.elapsedTime),
      },
      "request completed",
    );
    done();
  });

  if (devTools) {
    app.addHook("onRequest", async (request) => {
      if (request.method !== "GET") return;
      const params = new URLSearchParams(request.url.split("?")[1]);
      const delay = Number(params.get("_delay"));
      if (delay > 0) await sleep(Math.min(delay, MAX_DEV_DELAY_MS));
      if (params.get("_fail") === "1") {
        throw new AppError(
          500,
          "SIMULATED_FAILURE",
          "Simulated failure (_fail=1)",
        );
      }
    });
  }

  // All API errors use one shape: { error: { code, message, details? } }.
  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: `Invalid ${error.validationContext ?? "request"}`,
          details: error.validation.map((issue) => ({
            path: issue.instancePath,
            message: issue.message,
          })),
        },
      });
    }
    if (error instanceof AppError) {
      if (error.statusCode >= 500) request.log.warn({ err: error });
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      });
    }
    const statusCode = getStatusCode(error);
    if (statusCode >= 500) {
      // The stack goes to the log only, never to the client.
      request.log.error({ err: error });
      return reply.status(500).send({
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

  // Only routes with config.rateLimit are limited (the POST routes).
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_request, context) =>
      new AppError(
        429,
        "RATE_LIMITED",
        `Too many requests, try again in ${context.after}`,
      ),
  });

  if (webDistDir) {
    await app.register(fastifyStatic, { root: webDistDir });
  }

  const deps = { repo, today };
  registerHealthRoutes(app);
  registerStayRoutes(app, deps);
  registerReviewRoutes(app, deps);
  registerBookingRoutes(app, deps);

  return app;
}
