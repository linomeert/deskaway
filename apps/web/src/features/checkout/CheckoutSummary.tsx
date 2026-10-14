import type { StayDetail } from "@deskaway/shared";
import { Button } from "../../components/Button";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { COUNTRY_NAMES, formatDateRange, formatGuests } from "../../lib/format";
import type { BookingState } from "../stay/PricePanel";
import { PriceBreakdown } from "../stay/PriceBreakdown";
import type { StayParams } from "../stay/useStayParams";

function PriceDetails({
  stay,
  state,
  guests,
}: {
  stay: StayDetail;
  state: BookingState;
  guests: number;
}) {
  switch (state.status) {
    case "no-dates":
      return <p className="text-muted">Add your dates to see the price.</p>;
    case "loading":
      return (
        <div aria-busy="true" className="flex flex-col gap-2">
          <span className="sr-only">Loading price…</span>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-full" />
        </div>
      );
    case "unavailable":
      return <p className="text-danger">{state.reason}</p>;
    case "error":
      return (
        <div role="alert" className="flex flex-col gap-2 text-sm">
          <p className="text-danger">We couldn't load the price.</p>
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
      );
    case "bookable":
      return (
        <PriceBreakdown
          lines={state.quote.lines}
          total={state.quote.total}
          nights={state.quote.nights}
          guests={guests}
          pricePerNight={stay.pricePerNight}
          totalLabel="Total (EUR)"
        />
      );
  }
}

// Stays visible on every step. Prices come from GET /quote only.
export function CheckoutSummary({
  stay,
  state,
  params,
}: {
  stay: StayDetail;
  state: BookingState;
  params: StayParams;
}) {
  const [photo] = stay.photos;
  const { checkIn, checkOut, guests } = params;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-float">
      <div className="flex gap-4">
        {photo && (
          <img
            src={photo.url}
            alt=""
            className="h-20 w-24 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="flex min-w-0 flex-col">
          <p className="font-semibold">{stay.name}</p>
          <p className="text-sm text-muted">
            {stay.city}, {COUNTRY_NAMES[stay.country]}
          </p>
          <p className="text-sm text-muted">
            {checkIn && checkOut
              ? `${formatDateRange(checkIn, checkOut)} · ${formatGuests(guests)}`
              : formatGuests(guests)}
          </p>
        </div>
      </div>
      <hr className="border-border" />
      <h2 className="font-semibold">Price details</h2>
      <PriceDetails stay={stay} state={state} guests={guests} />
    </div>
  );
}
