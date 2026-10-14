import { nightsBetween, type StayDetail, todayIn } from "@deskaway/shared";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons";
import { cx } from "../../lib/cx";
import { addMonths, formatDay, monthStart, moveFocus } from "./calendar";
import { CalendarMonth } from "./CalendarMonth";
import { CALENDAR_ID } from "./focusCalendar";
import { useAvailability } from "./queries";
import { nightsText, useCalendarSelection } from "./useCalendarSelection";
import { useMediaQuery } from "./useMediaQuery";
import { useStayParams } from "./useStayParams";

// How far ahead the calendar goes, in months after the current one.
const MONTHS_AHEAD = 12;

// Built without a library: one <table> per month, days are buttons with full
// labels. Arrow keys move a roving focus; Enter or Space picks check-in, then
// check-out. The API decides bookability; blocked nights only guide the picks.
export function AvailabilityCalendar({ stay }: { stay: StayDetail }) {
  const { checkIn: urlCheckIn } = useStayParams();
  const [today] = useState(() => todayIn("Europe/Brussels"));
  const firstAllowed = monthStart(today);
  const lastAllowed = addMonths(firstAllowed, MONTHS_AHEAD);

  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const monthCount = isDesktop ? 2 : 1;

  const [firstMonth, setFirstMonth] = useState(() => {
    const start = monthStart(urlCheckIn ?? today);
    if (start < firstAllowed) return firstAllowed;
    return start > lastAllowed ? lastAllowed : start;
  });
  const [focusDate, setFocusDate] = useState(() => urlCheckIn ?? today);

  const windowEnd = addMonths(firstMonth, monthCount);
  const months = Array.from({ length: monthCount }, (_, index) =>
    addMonths(firstMonth, index),
  );
  const availability = useAvailability(stay.id, firstMonth, windowEnd);
  const { checkIn, checkOut, dayState, pick, clearDates, announcement } =
    useCalendarSelection(today, availability.data?.blocked ?? []);

  // Focus follows keyboard moves only, never a click or a re-render.
  const gridRef = useRef<HTMLDivElement>(null);
  const keyboardMove = useRef(false);
  useEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    const button = gridRef.current?.querySelector(
      `button[data-date="${focusDate}"]`,
    );
    if (button instanceof HTMLElement) button.focus();
  }, [focusDate, firstMonth]);

  const isVisible = (day: string) => day >= firstMonth && day < windowEnd;
  const tabbable = isVisible(focusDate)
    ? focusDate
    : isVisible(today)
      ? today
      : firstMonth;

  function onPick(day: string) {
    if (pick(day)) setFocusDate(day);
  }

  function onDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    const next = moveFocus(day, event.key);
    if (next === undefined) return;
    event.preventDefault();
    if (next < firstAllowed || next >= addMonths(lastAllowed, 1)) return;
    if (next < firstMonth) setFirstMonth(monthStart(next));
    else if (next >= windowEnd) {
      setFirstMonth(addMonths(monthStart(next), 1 - monthCount));
    }
    keyboardMove.current = true;
    setFocusDate(next);
  }

  function showMonths(start: string) {
    setFirstMonth(start);
  }

  const headingId = useId();
  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : undefined;

  let heading: string;
  if (nights !== undefined) heading = `${nightsText(nights)} in ${stay.city}`;
  else if (checkIn) heading = "Select check-out date";
  else heading = "Select check-in date";

  return (
    <section
      id={CALENDAR_ID}
      aria-labelledby={headingId}
      className="flex scroll-mt-6 flex-col gap-4"
    >
      <div>
        <h2 id={headingId} className="text-lg font-semibold">
          {heading}
        </h2>
        <p className="text-muted">
          {checkIn && checkOut
            ? `${formatDay(checkIn)} – ${formatDay(checkOut)}`
            : `Minimum stay: ${nightsText(stay.minNights)}`}
        </p>
      </div>

      <div
        ref={gridRef}
        aria-busy={availability.isFetching}
        className={cx("grid gap-8", monthCount === 2 && "grid-cols-2")}
      >
        {months.map((month, index) => (
          <CalendarMonth
            key={month}
            month={month}
            checkIn={checkIn}
            checkOut={checkOut}
            tabbable={tabbable}
            dayState={dayState}
            onPick={onPick}
            onDayKeyDown={onDayKeyDown}
            previousButton={
              index === 0 ? (
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={firstMonth <= firstAllowed}
                  onClick={() => {
                    showMonths(addMonths(firstMonth, -1));
                  }}
                  className="flex size-10 items-center justify-center rounded-full enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
              ) : undefined
            }
            nextButton={
              index === monthCount - 1 ? (
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={
                    addMonths(firstMonth, monthCount - 1) >= lastAllowed
                  }
                  onClick={() => {
                    showMonths(addMonths(firstMonth, 1));
                  }}
                  className="flex size-10 items-center justify-center rounded-full enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
              ) : undefined
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {availability.isError ? (
          <p
            role="alert"
            className="flex items-center gap-2 text-sm text-danger"
          >
            We couldn't load availability.
            <Button
              variant="ghost"
              size="sm"
              loading={availability.isFetching}
              onClick={() => {
                void availability.refetch();
              }}
            >
              Try again
            </Button>
          </p>
        ) : (
          <p className="text-sm text-muted">
            {availability.isPending ? "Loading availability…" : ""}
          </p>
        )}
        <button
          type="button"
          disabled={checkIn === undefined}
          onClick={clearDates}
          className="rounded-md font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          Clear dates
        </button>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
