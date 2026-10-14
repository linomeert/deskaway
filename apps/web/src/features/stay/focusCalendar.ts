export const CALENDAR_ID = "calendar";

// Used by the booking card's date cells and "Check availability": scroll to
// the calendar and put focus on its current day.
export function focusCalendar(): void {
  const calendar = document.getElementById(CALENDAR_ID);
  if (!calendar) return;
  calendar.scrollIntoView({ behavior: "smooth", block: "start" });
  const day = calendar.querySelector('button[data-date][tabindex="0"]');
  if (day instanceof HTMLElement) day.focus({ preventScroll: true });
}
