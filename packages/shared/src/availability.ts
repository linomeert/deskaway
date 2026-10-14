import type { DateRange } from "./schemas";

const MS_PER_DAY = 86_400_000;

// Date-only ISO strings parse as UTC midnight, so DST never shifts the count.
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / MS_PER_DAY);
}

export function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(isoDate) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
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

// Nights in [from, to) that are taken; check-out days are free.
export function blockedNights(
  bookings: readonly DateRange[],
  from: string,
  to: string,
): string[] {
  const blocked: string[] = [];
  for (let night = from; night < to; night = addDays(night, 1)) {
    if (!isAvailable(bookings, night, addDays(night, 1))) blocked.push(night);
  }
  return blocked;
}

// True if any night in [checkIn, checkOut) is in the blocked list. A blocked
// night on the check-out date is fine: guests leave that morning.
export function hasBlockedNight(
  blocked: readonly string[],
  checkIn: string,
  checkOut: string,
): boolean {
  return blocked.some((night) => night >= checkIn && night < checkOut);
}
