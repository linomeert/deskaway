import type {
  Booking,
  BookingCreate,
  Review,
  ReviewCreate,
  ReviewSort,
  StayDetail,
  StayPage,
  StaySearchQuery,
} from "@deskaway/shared";

export type AddReviewResult =
  | { ok: true; review: Review }
  | { ok: false; code: "NOT_FOUND" | "REVIEW_REJECTED" };

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | {
      ok: false;
      code:
        | "NOT_FOUND"
        | "CHECK_IN_IN_PAST"
        | "INVALID_DATES"
        | "MIN_NIGHTS"
        | "MAX_GUESTS"
        | "DATES_TAKEN";
      details?: Record<string, number>;
    };

// Async so a database can replace the in-memory implementation later.
// `undefined` means the stay or booking does not exist.
export interface StayRepository {
  findStays(query: StaySearchQuery): Promise<StayPage>;
  getStay(id: string): Promise<StayDetail | undefined>;
  getReviews(stayId: string, sort: ReviewSort): Promise<Review[] | undefined>;
  addReview(
    stayId: string,
    input: ReviewCreate,
    today: string,
  ): Promise<AddReviewResult>;
  getBookings(stayId: string): Promise<Booking[] | undefined>;
  createBooking(
    input: BookingCreate,
    today: string,
  ): Promise<CreateBookingResult>;
  getBooking(id: string): Promise<Booking | undefined>;
}
