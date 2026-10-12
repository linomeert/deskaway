import { nightsBetween } from "./availability";
import type { PriceLine, Quote, Stay } from "./schemas";

type PricedStay = Pick<
  Stay,
  | "pricePerNight"
  | "cleaningFee"
  | "cityTaxPerPersonPerNight"
  | "minNights"
  | "maxGuests"
>;

// Business rules only; input shape (ISO dates, guests >= 1) is validated by Zod.
// When several rules break, the first wins: INVALID_DATES -> MIN_NIGHTS -> MAX_GUESTS.
export function quote(
  stay: PricedStay,
  checkIn: string,
  checkOut: string,
  guests: number,
): Quote {
  const nights = nightsBetween(checkIn, checkOut);

  if (nights <= 0) {
    return { available: false, reason: "INVALID_DATES" };
  }
  if (nights < stay.minNights) {
    return {
      available: false,
      reason: "MIN_NIGHTS",
      minNights: stay.minNights,
    };
  }
  if (guests > stay.maxGuests) {
    return {
      available: false,
      reason: "MAX_GUESTS",
      maxGuests: stay.maxGuests,
    };
  }

  // Money is in integer cents, rounded once per line.
  const lines: PriceLine[] = [
    { kind: "nights", amount: Math.round(nights * stay.pricePerNight) },
    { kind: "cleaningFee", amount: Math.round(stay.cleaningFee) },
    {
      kind: "cityTax",
      amount: Math.round(guests * nights * stay.cityTaxPerPersonPerNight),
    },
  ];
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return { available: true, nights, lines, total };
}
