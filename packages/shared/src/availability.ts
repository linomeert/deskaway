import type { DateRange } from "./schemas";

const MS_PER_DAY = 86_400_000;

// Date-only ISO strings parse as UTC midnight, so DST never shifts the count.
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / MS_PER_DAY);
}

// YYYY-MM-DD strings sort chronologically, so string comparison is date comparison.
export function isBookableFrom(checkIn: string, today: string): boolean {
  return checkIn >= today;
}

// Check-out is exclusive: ranges overlap only if each starts before the other ends.
export function isAvailable(
  bookings: readonly DateRange[],
  checkIn: string,
  checkOut: string,
): boolean {
  return bookings.every(
    (booking) => !(checkIn < booking.checkOut && booking.checkIn < checkOut),
  );
}
