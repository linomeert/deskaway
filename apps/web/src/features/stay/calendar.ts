import { addDays } from "@deskaway/shared";

// Pure date helpers for the availability calendar. Dates are ISO YYYY-MM-DD
// calendar days, handled in UTC so time zones and clock changes never shift them.

function parts(iso: string): { year: number; month: number } {
  const date = new Date(`${iso}T00:00:00Z`);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function toIso(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

// "2026-11-17" -> "2026-11-01".
export function monthStart(iso: string): string {
  const { year, month } = parts(iso);
  return toIso(year, month, 1);
}

export function addMonths(month: string, count: number): string {
  const { year, month: index } = parts(month);
  return toIso(year, index + count, 1);
}

// Weeks of a month, Monday first. `null` pads the days outside the month.
export function monthGrid(month: string): (string | null)[][] {
  const { year, month: index } = parts(month);
  const first = new Date(Date.UTC(year, index, 1));
  const daysInMonth = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIso(year, index, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let start = 0; start < cells.length; start += 7) {
    weeks.push(cells.slice(start, start + 7));
  }
  return weeks;
}

const ARROW_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

// The day an arrow key moves to, or undefined for any other key.
export function moveFocus(iso: string, key: string): string | undefined {
  const step = ARROW_STEPS[key];
  return step === undefined ? undefined : addDays(iso, step);
}

const longDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "Tuesday 3 November 2026, available". Built from parts so the output does
// not depend on the ICU version's comma rules.
export function dayLabel(iso: string, status: string): string {
  const order: Intl.DateTimeFormatPartTypes[] = [
    "weekday",
    "day",
    "month",
    "year",
  ];
  const byType = new Map(
    longDay
      .formatToParts(new Date(`${iso}T00:00:00Z`))
      .map((part) => [part.type, part.value]),
  );
  const date = order.map((type) => byType.get(type)).join(" ");
  return `${date}, ${status}`;
}

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "November 2026".
export function monthLabel(month: string): string {
  return monthYear.format(new Date(`${month}T00:00:00Z`));
}

const shortDay = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "2 Nov 2026".
export function formatDay(iso: string): string {
  return shortDay.format(new Date(`${iso}T00:00:00Z`));
}
