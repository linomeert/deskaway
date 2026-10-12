import {
  AvailabilityQuerySchema,
  AvailabilitySchema,
  IdParamsSchema,
  QuoteQuerySchema,
  QuoteSchema,
  StayDetailSchema,
  StayPageSchema,
  StaySearchQuerySchema,
  blockedNights,
  isBookableFrom,
  quote,
} from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { AppError, notFound } from "../errors";
import type { RouteDeps } from "./deps";

export function registerStayRoutes(
  fastify: FastifyInstance,
  { repo, today }: RouteDeps,
): void {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/api/stays",
    {
      schema: {
        querystring: StaySearchQuerySchema,
        response: { 200: StayPageSchema },
      },
    },
    (request) => repo.findStays(request.query),
  );

  app.get(
    "/api/stays/:id",
    {
      schema: {
        params: IdParamsSchema,
        response: { 200: StayDetailSchema },
      },
    },
    async (request) => {
      const stay = await repo.getStay(request.params.id);
      if (!stay) throw notFound("Stay", request.params.id);
      return stay;
    },
  );

  app.get(
    "/api/stays/:id/quote",
    {
      schema: {
        params: IdParamsSchema,
        querystring: QuoteQuerySchema,
        response: { 200: QuoteSchema },
      },
    },
    async (request) => {
      const { checkIn, checkOut, guests } = request.query;
      const stay = await repo.getStay(request.params.id);
      if (!stay) throw notFound("Stay", request.params.id);
      if (!isBookableFrom(checkIn, today())) {
        throw new AppError(
          422,
          "CHECK_IN_IN_PAST",
          "Check-in cannot be in the past",
        );
      }
      return quote(stay, checkIn, checkOut, guests);
    },
  );

  app.get(
    "/api/stays/:id/availability",
    {
      schema: {
        params: IdParamsSchema,
        querystring: AvailabilityQuerySchema,
        response: { 200: AvailabilitySchema },
      },
    },
    async (request) => {
      const bookings = await repo.getBookings(request.params.id);
      if (!bookings) throw notFound("Stay", request.params.id);
      const { from, to } = request.query;
      return { blocked: blockedNights(bookings, from, to) };
    },
  );
}
