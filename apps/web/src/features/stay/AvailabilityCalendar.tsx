import {
  hasBlockedNight,
  nightsBetween,
  type StayDetail,
  todayIn,
} from "@deskaway/shared";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons";
import { cx } from "../../lib/cx";
import {
  addMonths,
  dayLabel,
  formatDay,
  monthGrid,
  monthLabel,
  monthStart,
  moveFocus,
} from "./calendar";
import { CALENDAR_ID } from "./focusCalendar";
import { useAvailability } from "./queries";
import { useMediaQuery } from "./useMediaQuery";
import { useStayParams } from "./useStayParams";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// How far ahead the calendar goes, in months after the current one.
const MONTHS_AHEAD = 12;

function nightsText(nights: number): string {
  return nights === 1 ? "1 night" : `${String(nights)} nights`;
}

interface DayState {
  selectable: boolean;
  label: string;
}

// Built without a library: one <table> per month, days are buttons with full
// labels. Arrow keys move a roving focus; Enter or Space picks check-in, then
// check-out. The API decides bookability; blocked nights only guide the picks.
export function AvailabilityCalendar({ stay }: { stay: StayDetail }) {
  const {
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    setDates,
  } = useStayParams();
  const [today] = useState(() => todayIn("Europe/Brussels"));
  const firstAllowed = monthStart(today);
  const lastAllowed = addMonths(firstAllowed, MONTHS_AHEAD);

  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const monthCount = isDesktop ? 2 : 1;

  // A check-in picked in the calendar but no check-out yet. The URL only ever
  // holds a full range.
  const [pending, setPending] = useState<string>();
  const checkIn = pending ?? urlCheckIn;
  const checkOut = pending === undefined ? urlCheckOut : undefined;

  const [firstMonth, setFirstMonth] = useState(() => {
    const start = monthStart(urlCheckIn ?? today);
    if (start < firstAllowed) return firstAllowed;
    return start > lastAllowed ? lastAllowed : start;
  });
  const [focusDate, setFocusDate] = useState(() => urlCheckIn ?? today);
  const [announcement, setAnnouncement] = useState("");

  const windowEnd = addMonths(firstMonth, monthCount);
  const months = Array.from({ length: monthCount }, (_, index) =>
    addMonths(firstMonth, index),
  );
  const availability = useAvailability(stay.id, firstMonth, windowEnd);
  const blockedList = availability.data?.blocked ?? [];
  const blocked = new Set(blockedList);

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

  function dayState(day: string): DayState {
    let selectable: boolean;
    let status: string;
    if (day < today) {
      selectable = false;
      status = "unavailable";
    } else if (checkIn && !checkOut && day > checkIn) {
      // Picking check-out: every night up to this day must be free.
      selectable = !hasBlockedNight(blockedList, checkIn, day);
      status = selectable ? "available for check-out" : "unavailable";
    } else {
      selectable = !blocked.has(day);
      status = selectable ? "available" : "unavailable";
    }

    let role = "";
    if (day === checkIn) role = "selected as check-in";
    else if (day === checkOut) role = "selected as check-out";
    else if (checkIn && checkOut && day > checkIn && day < checkOut) {
      role = "in your stay";
    }
    return {
      selectable,
      label: dayLabel(day, role ? `${status}, ${role}` : status),
    };
  }

  function pick(day: string) {
    if (!dayState(day).selectable) return;
    setFocusDate(day);
    if (checkIn && !checkOut && day > checkIn) {
      setPending(undefined);
      setDates({ checkIn, checkOut: day });
      setAnnouncement(
        `Check-out ${formatDay(day)} selected. ${nightsText(nightsBetween(checkIn, day))}.`,
      );
    } else {
      setPending(day);
      if (urlCheckIn) setDates(undefined);
      setAnnouncement(
        `Check-in ${formatDay(day)} selected. Now choose your check-out date.`,
      );
    }
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

  function clearDates() {
    setPending(undefined);
    setDates(undefined);
    setAnnouncement("Dates cleared.");
  }

  const headingId = useId();
  const monthIdPrefix = useId();
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
        {months.map((month, index) => {
          const monthId = `${monthIdPrefix}-${String(index)}`;
          return (
            <div key={month}>
              <div className="mb-2 flex items-center justify-between">
                {index === 0 ? (
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
                ) : (
                  <span className="size-10" />
                )}
                <h3 id={monthId} className="font-semibold">
                  {monthLabel(month)}
                </h3>
                {index === monthCount - 1 ? (
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
                ) : (
                  <span className="size-10" />
                )}
              </div>
              <table
                aria-labelledby={monthId}
                className="w-full table-fixed border-collapse"
              >
                <thead>
                  <tr>
                    {WEEKDAYS.map((weekday) => (
                      <th
                        key={weekday}
                        scope="col"
                        className="pb-1 text-sm font-semibold text-muted"
                      >
                        <span aria-hidden="true">{weekday.charAt(0)}</span>
                        <span className="sr-only">{weekday}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthGrid(month).map((week) => (
                    <tr key={week.find(Boolean) ?? month}>
                      {week.map((day, column) => {
                        if (day === null) {
                          return <td key={`pad-${String(column)}`} />;
                        }
                        const { selectable, label } = dayState(day);
                        const isEnd = day === checkIn || day === checkOut;
                        const inRange =
                          checkIn !== undefined &&
                          checkOut !== undefined &&
                          day > checkIn &&
                          day < checkOut;
                        return (
                          <td
                            key={day}
                            className={cx(
                              "py-0.5",
                              inRange && "bg-surface-alt",
                            )}
                          >
                            <button
                              type="button"
                              data-date={day}
                              tabIndex={day === tabbable ? 0 : -1}
                              aria-label={label}
                              aria-pressed={isEnd}
                              aria-disabled={!selectable || undefined}
                              onClick={() => {
                                pick(day);
                              }}
                              onKeyDown={(event) => {
                                onDayKeyDown(event, day);
                              }}
                              className={cx(
                                "mx-auto flex size-10 items-center justify-center rounded-full text-sm tabular-nums",
                                isEnd &&
                                  "bg-primary font-semibold text-surface",
                                !isEnd &&
                                  selectable &&
                                  "hover:ring-1 hover:ring-ink",
                                !selectable &&
                                  "cursor-not-allowed text-muted line-through",
                              )}
                            >
                              {Number(day.slice(8))}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
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
