import { type KeyboardEvent, type ReactNode, useId } from "react";
import { cx } from "../../lib/cx";
import { monthGrid, monthLabel } from "./calendar";
import type { DayState } from "./useCalendarSelection";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface CalendarMonthProps {
  month: string;
  checkIn: string | undefined;
  checkOut: string | undefined;
  // The one day button in the tab order (roving tabindex).
  tabbable: string;
  dayState: (day: string) => DayState;
  onPick: (day: string) => void;
  onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, day: string) => void;
  // Month navigation sits beside the heading; a spacer keeps it centred.
  previousButton?: ReactNode;
  nextButton?: ReactNode;
}

// One month: its heading and a <table> of day buttons with full labels.
export function CalendarMonth({
  month,
  checkIn,
  checkOut,
  tabbable,
  dayState,
  onPick,
  onDayKeyDown,
  previousButton,
  nextButton,
}: CalendarMonthProps) {
  const monthId = useId();
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        {previousButton ?? <span className="size-10" />}
        <h3 id={monthId} className="font-semibold">
          {monthLabel(month)}
        </h3>
        {nextButton ?? <span className="size-10" />}
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
                    className={cx("py-0.5", inRange && "bg-surface-alt")}
                  >
                    <button
                      type="button"
                      data-date={day}
                      tabIndex={day === tabbable ? 0 : -1}
                      aria-label={label}
                      aria-pressed={isEnd}
                      aria-disabled={!selectable || undefined}
                      onClick={() => {
                        onPick(day);
                      }}
                      onKeyDown={(event) => {
                        onDayKeyDown(event, day);
                      }}
                      className={cx(
                        "mx-auto flex size-10 items-center justify-center rounded-full text-sm tabular-nums",
                        isEnd && "bg-primary font-semibold text-surface",
                        !isEnd && selectable && "hover:ring-1 hover:ring-ink",
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
}
