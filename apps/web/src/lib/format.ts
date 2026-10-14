import type { Country, WorkspaceType } from "@deskaway/shared";

// Display only: amounts and dates come from the API as they are.

const LOCALE = "en-IE";

const euros = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const eurosWithCents = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

// €115 for whole euros, €7.50 otherwise.
export function formatPrice(cents: number): string {
  const format = cents % 100 === 0 ? euros : eurosWithCents;
  return format.format(cents / 100);
}

const dayMonth = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// ISO dates are calendar days, so format them in UTC to avoid shifting a day.
function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

// "2–16 Nov", "28 Nov – 3 Dec".
export function formatDateRange(checkIn: string, checkOut: string): string {
  return dayMonth.formatRange(utcDate(checkIn), utcDate(checkOut));
}

const longDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "Mon 2 Nov 2026". en-GB adds a comma after the weekday; drop it.
export function formatLongDate(isoDate: string): string {
  return longDay.format(utcDate(isoDate)).replace(",", "");
}

export function formatGuests(guests: number): string {
  return guests === 1 ? "1 guest" : `${String(guests)} guests`;
}

export const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  desk: "Desk",
  desk_monitor: "Desk + monitor",
  office: "Office",
};

export const COUNTRY_NAMES: Record<Country, string> = {
  BE: "Belgium",
  NL: "Netherlands",
  LU: "Luxembourg",
};
