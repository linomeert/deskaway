import {
  IdParamsSchema,
  ReviewCreateSchema,
  ReviewSchema,
  ReviewsQuerySchema,
} from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError, notFound } from "../errors";
import { WRITE_RATE_LIMIT, type RouteDeps } from "./deps";

export function registerReviewRoutes(
  fastify: FastifyInstance,
  { repo, today }: RouteDeps,
): void {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/api/stays/:id/reviews",
    {
      schema: {
        params: IdParamsSchema,
        querystring: ReviewsQuerySchema,
        response: { 200: z.array(ReviewSchema) },
      },
    },
    async (request) => {
      const reviews = await repo.getReviews(
        request.params.id,
        request.query.sort,
      );
      if (!reviews) throw notFound("Stay", request.params.id);
      return reviews;
    },
  );

  app.post(
    "/api/stays/:id/reviews",
    {
      config: { rateLimit: WRITE_RATE_LIMIT },
      schema: {
        params: IdParamsSchema,
        body: ReviewCreateSchema,
        response: { 201: ReviewSchema },
      },
    },
    async (request, reply) => {
      const result = await repo.addReview(
        request.params.id,
        request.body,
        today(),
      );
      if (result.ok) return reply.status(201).send(result.review);
      if (result.code === "NOT_FOUND") {
        throw notFound("Stay", request.params.id);
      }
      // The matched word is not echoed back.
      throw new AppError(
        422,
        "REVIEW_REJECTED",
        "The review contains language we don't publish",
      );
    },
  );
}
