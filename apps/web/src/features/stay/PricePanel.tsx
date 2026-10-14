import type { Quote, StayDetail } from "@deskaway/shared";
import { useId } from "react";
import { Link } from "react-router";
import { Button } from "../../components/Button";
import { Select } from "../../components/Field";
import { ApiError } from "../../lib/api";
import { cx } from "../../lib/cx";
import { formatDateRange, formatGuests, formatPrice } from "../../lib/format";
import { formatDay } from "./calendar";
import { focusCalendar } from "./focusCalendar";
import { PriceBreakdown } from "./PriceBreakdown";
import { useQuote } from "./queries";
import { checkoutHref, type StayParams, useStayParams } from "./useStayParams";

type UnavailableQuote = Extract<Quote, { available: false }>;
type AvailableQuote = Extract<Quote, { available: true }>;

// The API decides; this only words the reason codes.
function reasonText(quote: UnavailableQuote): string {
  switch (quote.reason) {
    case "INVALID_DATES":
      return "Check-out must be after check-in.";
    case "MIN_NIGHTS":
      return `Minimum stay is ${String(quote.minNights)} nights.`;
    case "MAX_GUESTS":
      return `This stay fits up to ${formatGuests(quote.maxGuests)}.`;
    case "DATES_TAKEN":
      return "Some of these nights are already booked.";
  }
}

export type BookingState =
  | { status: "no-dates" }
  | { status: "loading" }
  | { status: "bookable"; quote: AvailableQuote }
  | { status: "unavailable"; reason: string }
  | { status: "error"; error: Error; retry: () => void; retrying: boolean };

// Also used by the checkout, where the same URL params hold the trip.
export function useBookingState(stay: StayDetail) {
  const params = useStayParams();
  const { checkIn, checkOut, guests } = params;
  const query = checkIn && checkOut ? { checkIn, checkOut, guests } : undefined;
  const { data, error, isPending, isError, isFetching, refetch } = useQuote(
    stay.id,
    query,
  );

  let state: BookingState;
  if (!query) state = { status: "no-dates" };
  else if (isError) {
    state =
      error instanceof ApiError && error.code === "CHECK_IN_IN_PAST"
        ? { status: "unavailable", reason: "Check-in can't be in the past." }
        : {
            status: "error",
            error,
            retry: () => void refetch(),
            retrying: isFetching,
          };
  } else if (isPending) state = { status: "loading" };
  else if (data.available) state = { status: "bookable", quote: data };
  else state = { status: "unavailable", reason: reasonText(data) };

  return { state, params };
}

const LINK_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 font-semibold text-surface hover:bg-primary-hover";

interface ActionProps {
  stayId: string;
  state: BookingState;
  params: StayParams;
  reasonId?: string;
  className?: string;
}

function BookingAction({
  stayId,
  state,
  params,
  reasonId,
  className,
}: ActionProps) {
  switch (state.status) {
    case "no-dates":
      return (
        <Button className={className} onClick={focusCalendar}>
          Check availability
        </Button>
      );
    case "bookable":
      return (
        <Link
          to={checkoutHref(stayId, params)}
          className={cx(LINK_BUTTON, className)}
        >
          Reserve
        </Link>
      );
    case "loading":
      return (
        <Button className={className} loading>
          Reserve
        </Button>
      );
    case "unavailable":
    case "error":
      return (
        <Button className={className} disabled aria-describedby={reasonId}>
          Reserve
        </Button>
      );
  }
}

function DateCell({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={focusCalendar}
      className="flex flex-col items-start px-3 py-2 text-left hover:bg-surface-alt"
    >
      <span className="text-sm font-semibold uppercase">{label}</span>
      <span className={value ? "text-ink" : "text-muted"}>
        {value ? formatDay(value) : "Add date"}
      </span>
    </button>
  );
}

// Booking card: floating and sticky on desktop, a bar at the bottom of the
// screen on mobile. Prices come from GET /quote only.
export function PricePanel({ stay }: { stay: StayDetail }) {
  const { state, params } = useBookingState(stay);
  const reasonId = useId();
  const guestsId = useId();
  const guestOptions = Array.from(
    { length: Math.max(stay.maxGuests, params.guests) },
    (_, index) => index + 1,
  );

  return (
    <>
      <div className="hidden flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-float lg:sticky lg:top-6 lg:flex">
        <p>
          <span className="text-lg font-semibold">
            {formatPrice(stay.pricePerNight)}
          </span>{" "}
          night
        </p>

        <div className="overflow-hidden rounded-md border border-ink">
          <div className="grid grid-cols-2 divide-x divide-ink">
            <DateCell label="Check-in" value={params.checkIn} />
            <DateCell label="Check-out" value={params.checkOut} />
          </div>
          <div className="flex flex-col border-t border-ink px-3 py-2">
            <label
              htmlFor={guestsId}
              className="text-sm font-semibold uppercase"
            >
              Guests
            </label>
            <Select
              id={guestsId}
              value={params.guests}
              onChange={(event) => {
                params.setGuests(Number(event.target.value));
              }}
              className="h-auto border-0 px-0"
            >
              {guestOptions.map((count) => (
                <option key={count} value={count}>
                  {formatGuests(count)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {state.status === "unavailable" && (
          <p id={reasonId} className="text-sm text-danger">
            {state.reason}
          </p>
        )}
        {state.status === "error" && (
          <div
            id={reasonId}
            role="alert"
            className="flex flex-col gap-2 text-sm"
          >
            <p className="text-danger">We couldn't check these dates.</p>
            {state.error instanceof ApiError && state.error.requestId && (
              <p className="text-muted">Request ID: {state.error.requestId}</p>
            )}
            <Button
              variant="secondary"
              size="sm"
              loading={state.retrying}
              onClick={state.retry}
              className="self-start"
            >
              Try again
            </Button>
          </div>
        )}

        <BookingAction
          stayId={stay.id}
          state={state}
          params={params}
          reasonId={reasonId}
          className="w-full"
        />
        <p className="text-center text-sm text-muted">
          You won't be charged (demo)
        </p>

        {state.status === "bookable" && (
          <PriceBreakdown
            lines={state.quote.lines}
            total={state.quote.total}
            nights={state.quote.nights}
            guests={params.guests}
            pricePerNight={stay.pricePerNight}
          />
        )}
      </div>

      <MobileBookingBar stay={stay} state={state} params={params} />
    </>
  );
}

function MobileBookingBar({
  stay,
  state,
  params,
}: {
  stay: StayDetail;
  state: BookingState;
  params: StayParams;
}) {
  const reasonId = useId();
  const { checkIn, checkOut } = params;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-4 py-3 sm:px-6 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col items-start">
          <p>
            <span className="font-semibold">
              {formatPrice(stay.pricePerNight)}
            </span>{" "}
            night
          </p>
          <button
            type="button"
            onClick={focusCalendar}
            className="rounded-md text-sm font-semibold underline underline-offset-4"
          >
            {checkIn && checkOut ? (
              <>
                <span className="sr-only">Change dates, </span>
                {formatDateRange(checkIn, checkOut)}
              </>
            ) : (
              "Add dates"
            )}
          </button>
        </div>
        <BookingAction
          stayId={stay.id}
          state={state}
          params={params}
          reasonId={reasonId}
          className="shrink-0"
        />
      </div>
      {(state.status === "unavailable" || state.status === "error") && (
        <p id={reasonId} className="mt-1 text-sm text-danger">
          {state.status === "unavailable"
            ? state.reason
            : "We couldn't check these dates."}
        </p>
      )}
    </div>
  );
}
