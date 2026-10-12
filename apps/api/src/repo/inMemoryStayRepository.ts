import { randomUUID } from "node:crypto";
import {
  isAvailable,
  isBookableFrom,
  moderateReview,
  quote,
  summarizeReviews,
  workScore,
  type Booking,
  type Review,
  type ReviewSort,
  type StayListing,
  type StaySort,
  type StaySummary,
} from "@deskaway/shared";
import type { Seed } from "../seed";
import type { StayRepository } from "./StayRepository";

export const PAGE_SIZE = 10;

const STAY_ORDER: Record<StaySort, (a: StaySummary, b: StaySummary) => number> =
  {
    workScore: (a, b) => b.workScore - a.workScore,
    priceAsc: (a, b) => a.pricePerNight - b.pricePerNight,
    priceDesc: (a, b) => b.pricePerNight - a.pricePerNight,
    // Stays without reviews go last.
    rating: (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
  };

const REVIEW_ORDER: Record<ReviewSort, (a: Review, b: Review) => number> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  rating: (a, b) => b.rating - a.rating,
};

export function createInMemoryStayRepository(seed: Seed): StayRepository {
  const stays = new Map(seed.stays.map((stay) => [stay.id, stay]));
  const reviews = [...seed.reviews];
  const bookings = [...seed.bookings];

  const reviewsOf = (stayId: string): Review[] =>
    reviews.filter((review) => review.stayId === stayId);
  const bookingsOf = (stayId: string): Booking[] =>
    bookings.filter((booking) => booking.stayId === stayId);

  function summarize(stay: StayListing): StaySummary {
    const stayReviews = reviewsOf(stay.id);
    const summary = summarizeReviews(stayReviews);
    return {
      ...stay,
      workScore: workScore(stay, stayReviews),
      averageRating: summary.rating,
      reviewCount: summary.count,
    };
  }

  return {
    findStays(query) {
      const { checkIn, checkOut } = query;
      const items = [...stays.values()]
        .filter(
          (stay) =>
            (query.city === undefined || stay.city === query.city) &&
            (query.minWifi === undefined ||
              stay.wifiDownloadMbps >= query.minWifi) &&
            (query.workspace === undefined ||
              stay.workspaceType === query.workspace) &&
            query.guests <= stay.maxGuests &&
            (checkIn === undefined ||
              checkOut === undefined ||
              isAvailable(bookingsOf(stay.id), checkIn, checkOut)),
        )
        .map((stay) => {
          const item = summarize(stay);
          // Min-nights failures stay in the list so the UI can explain them.
          return checkIn === undefined || checkOut === undefined
            ? item
            : { ...item, quote: quote(stay, checkIn, checkOut, query.guests) };
        })
        .sort(
          (a, b) =>
            STAY_ORDER[query.sort](a, b) || a.name.localeCompare(b.name),
        );

      const start = (query.page - 1) * PAGE_SIZE;
      return Promise.resolve({
        items: items.slice(start, start + PAGE_SIZE),
        total: items.length,
        page: query.page,
        pageSize: PAGE_SIZE,
      });
    },

    getStay(id) {
      const stay = stays.get(id);
      if (!stay) return Promise.resolve(undefined);
      const stayReviews = reviewsOf(id);
      return Promise.resolve({
        ...stay,
        workScore: workScore(stay, stayReviews),
        reviewSummary: summarizeReviews(stayReviews),
      });
    },

    getReviews(stayId, sort) {
      if (!stays.has(stayId)) return Promise.resolve(undefined);
      return Promise.resolve(reviewsOf(stayId).sort(REVIEW_ORDER[sort]));
    },

    addReview(stayId, input, today) {
      if (!stays.has(stayId)) {
        return Promise.resolve({ ok: false, code: "NOT_FOUND" });
      }
      if (!moderateReview(`${input.authorName} ${input.text}`).ok) {
        return Promise.resolve({ ok: false, code: "REVIEW_REJECTED" });
      }
      const review: Review = {
        ...input,
        id: randomUUID(),
        stayId,
        createdAt: today,
      };
      reviews.push(review);
      return Promise.resolve({ ok: true, review });
    },

    getBookings(stayId) {
      if (!stays.has(stayId)) return Promise.resolve(undefined);
      return Promise.resolve(bookingsOf(stayId));
    },

    // Order (NOTES.md): past check-in -> quote rules -> overlap.
    // The price always comes from quote(); the client never sends one.
    // Check and insert run without an await in between, so two requests can't both win.
    createBooking(input, today) {
      const stay = stays.get(input.stayId);
      if (!stay) return Promise.resolve({ ok: false, code: "NOT_FOUND" });
      if (!isBookableFrom(input.checkIn, today)) {
        return Promise.resolve({ ok: false, code: "CHECK_IN_IN_PAST" });
      }

      const price = quote(stay, input.checkIn, input.checkOut, input.guests);
      if (!price.available) {
        const details: Record<string, number> | undefined =
          price.reason === "MIN_NIGHTS"
            ? { minNights: price.minNights }
            : price.reason === "MAX_GUESTS"
              ? { maxGuests: price.maxGuests }
              : undefined;
        return Promise.resolve({ ok: false, code: price.reason, details });
      }
      if (!isAvailable(bookingsOf(stay.id), input.checkIn, input.checkOut)) {
        return Promise.resolve({ ok: false, code: "DATES_TAKEN" });
      }

      const booking: Booking = {
        ...input,
        id: randomUUID(),
        nights: price.nights,
        lines: price.lines,
        total: price.total,
        createdAt: today,
      };
      bookings.push(booking);
      return Promise.resolve({ ok: true, booking });
    },

    getBooking(id) {
      return Promise.resolve(bookings.find((booking) => booking.id === id));
    },
  };
}
