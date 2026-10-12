import { BookingSchema } from "@deskaway/shared";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { errorOf } from "../test/errorOf";

const TODAY = "2026-10-12";

const booking = {
  stayId: "ghent-dok-noord-studio",
  checkIn: "2026-11-02",
  checkOut: "2026-11-06",
  guests: 1,
  guestName: "Ada Lovelace",
  guestEmail: "ada@example.com",
};

describe("booking routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ today: () => TODAY });
  });

  afterEach(async () => {
    await app.close();
  });

  function postBooking(payload: object) {
    return app.inject({ method: "POST", url: "/api/bookings", payload });
  }

  it("books with a server-side price, then returns 409 for the same dates", async () => {
    // The client tries to set its own price; the server ignores it.
    const created = await postBooking({ ...booking, total: 1 });

    expect(created.statusCode).toBe(201);
    const body = BookingSchema.parse(created.json());
    // 4 nights x 75 EUR + 30 EUR cleaning + 4 x 3 EUR city tax.
    expect(body.total).toBe(4 * 7500 + 3000 + 4 * 300);
    expect(body).toEqual(expect.objectContaining({ nights: 4, ...booking }));

    const again = await postBooking(booking);

    expect(again.statusCode).toBe(409);
    expect(errorOf(again)).toEqual(
      expect.objectContaining({ code: "DATES_TAKEN" }),
    );
  });

  it("stores the optional business fields and returns the booking by id", async () => {
    const business = {
      company: "Analytical Engines Ltd",
      vatNumber: "BE0123456789",
      note: "Late arrival, around 22:00.",
    };
    const created = BookingSchema.parse(
      (await postBooking({ ...booking, ...business })).json(),
    );

    const response = await app.inject({ url: `/api/bookings/${created.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(created);
    expect(created).toEqual(expect.objectContaining(business));
  });

  it("returns seed bookings by id", async () => {
    const response = await app.inject({ url: "/api/bookings/booking-01" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        checkIn: TODAY,
        stayId: "amsterdam-jordaan-apartment",
      }),
    );
  });

  it("rejects a check-in in the past with 422", async () => {
    const response = await postBooking({
      ...booking,
      checkIn: "2026-10-10",
      checkOut: "2026-10-14",
    });

    expect(response.statusCode).toBe(422);
    expect(errorOf(response)).toEqual(
      expect.objectContaining({ code: "CHECK_IN_IN_PAST" }),
    );
  });

  it("rejects a stay shorter than the minimum with 422 and the minimum", async () => {
    const response = await postBooking({
      ...booking,
      stayId: "la-roche-ourthe-chalet",
    });

    expect(response.statusCode).toBe(422);
    expect(errorOf(response)).toEqual(
      expect.objectContaining({
        code: "MIN_NIGHTS",
        details: { minNights: 7 },
      }),
    );
  });

  it("rejects an invalid body with 400", async () => {
    const response = await postBooking({ ...booking, guestEmail: "nope" });

    expect(response.statusCode).toBe(400);
    expect(errorOf(response)).toEqual(
      expect.objectContaining({ code: "VALIDATION_ERROR" }),
    );
  });

  it("returns 404 with the error shape for an unknown booking or stay", async () => {
    const unknownBooking = await app.inject({ url: "/api/bookings/nope" });
    const unknownStay = await postBooking({ ...booking, stayId: "nope" });

    expect(unknownBooking.statusCode).toBe(404);
    expect(unknownBooking.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Booking nope not found" },
    });
    expect(unknownStay.statusCode).toBe(404);
    expect(unknownStay.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Stay nope not found" },
    });
  });

  it("rate-limits POST requests", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await postBooking({ ...booking, guests: 0 })).statusCode);
    }

    expect(statuses.slice(0, 10).every((status) => status === 400)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});
