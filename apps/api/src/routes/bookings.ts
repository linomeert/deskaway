import {
  BookingCreateSchema,
  BookingSchema,
  IdParamsSchema,
} from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { AppError, notFound } from "../errors";
import type { CreateBookingResult } from "../repo/StayRepository";
import { WRITE_RATE_LIMIT, type RouteDeps } from "./deps";

type BookingErrorCode = Extract<CreateBookingResult, { ok: false }>["code"];

const BOOKING_ERRORS: Record<
  Exclude<BookingErrorCode, "NOT_FOUND">,
  { status: number; message: string }
> = {
  CHECK_IN_IN_PAST: { status: 422, message: "Check-in cannot be in the past" },
  INVALID_DATES: { status: 422, message: "Check-out must be after check-in" },
  MIN_NIGHTS: { status: 422, message: "The stay is shorter than the minimum" },
  MAX_GUESTS: { status: 422, message: "Too many guests for this stay" },
  DATES_TAKEN: { status: 409, message: "These dates were just booked" },
};

export function registerBookingRoutes(
  fastify: FastifyInstance,
  { repo, today }: RouteDeps,
): void {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Zod strips unknown keys, so a price sent by the client never reaches the repo.
  app.post(
    "/api/bookings",
    {
      config: { rateLimit: WRITE_RATE_LIMIT },
      schema: {
        body: BookingCreateSchema,
        response: { 201: BookingSchema },
      },
    },
    async (request, reply) => {
      const result = await repo.createBooking(request.body, today());
      if (result.ok) return reply.status(201).send(result.booking);
      if (result.code === "NOT_FOUND") {
        throw notFound("Stay", request.body.stayId);
      }
      const { status, message } = BOOKING_ERRORS[result.code];
      throw new AppError(status, result.code, message, result.details);
    },
  );

  app.get(
    "/api/bookings/:id",
    {
      schema: {
        params: IdParamsSchema,
        response: { 200: BookingSchema },
      },
    },
    async (request) => {
      const booking = await repo.getBooking(request.params.id);
      if (!booking) throw notFound("Booking", request.params.id);
      return booking;
    },
  );
}
