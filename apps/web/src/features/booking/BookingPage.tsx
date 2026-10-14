import type { Booking, StayDetail } from "@deskaway/shared";
import { Link, useParams } from "react-router";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { formatLongDate } from "../../lib/format";
import { useStay } from "../stay/queries";
import { PriceBreakdown } from "../stay/PriceBreakdown";
import { useBooking } from "./queries";

const BACK_TO_SEARCH =
  "inline-flex h-11 items-center justify-center rounded-md border border-muted bg-surface px-5 font-semibold text-ink hover:bg-surface-alt";

function LoadingBooking() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Loading booking…</span>
      <Skeleton className="aspect-2/1 w-full rounded-lg" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Confirmation({
  booking,
  stay,
}: {
  booking: Booking;
  stay: StayDetail;
}) {
  const [photo] = stay.photos;

  return (
    <article className="flex flex-col gap-6">
      {photo && (
        <img
          src={photo.url}
          alt={photo.alt}
          className="aspect-2/1 w-full rounded-lg object-cover"
        />
      )}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">You're going to {stay.city}!</h1>
        <p className="text-muted">
          Booking reference{" "}
          <strong className="font-mono text-ink select-all">
            {booking.id}
          </strong>{" "}
          · confirmation sent to your email (demo)
        </p>
      </div>

      <hr className="border-border" />
      <dl className="grid grid-cols-2 gap-4">
        <Detail label="Check-in" value={formatLongDate(booking.checkIn)} />
        <Detail label="Check-out" value={formatLongDate(booking.checkOut)} />
        <Detail label="Stay" value={stay.name} />
        <Detail label="Guests" value={String(booking.guests)} />
      </dl>

      <hr className="border-border" />
      <section aria-label="Price details">
        <PriceBreakdown
          lines={booking.lines}
          total={booking.total}
          nights={booking.nights}
          guests={booking.guests}
          pricePerNight={stay.pricePerNight}
          totalLabel="Total paid (demo)"
        />
      </section>

      <Link to="/" className={`${BACK_TO_SEARCH} self-start`}>
        Back to search
      </Link>
    </article>
  );
}

function errorMessage(error: Error | null): string {
  return error instanceof ApiError && error.status === 0
    ? error.message
    : "Something went wrong on our side. Please try again.";
}

export function BookingPage() {
  const { id = "" } = useParams();
  const booking = useBooking(id);
  // The photo, name and city come from the stay.
  const stay = useStay(booking.data?.stayId);

  let content;
  if (
    booking.isError &&
    booking.error instanceof ApiError &&
    booking.error.status === 404
  ) {
    content = (
      <>
        <h1 className="sr-only">Booking not found</h1>
        <EmptyState
          title="We can't find this booking."
          description="Check the link, or start a new search."
          actions={
            <Link to="/" className={BACK_TO_SEARCH}>
              Back to search
            </Link>
          }
        />
      </>
    );
  } else if (booking.isError || stay.isError) {
    const failed = booking.isError ? booking : stay;
    content = (
      <>
        <h1 className="sr-only">Your booking</h1>
        <ErrorState
          title="We couldn't load your booking"
          message={errorMessage(failed.error)}
          onRetry={() => {
            void failed.refetch();
          }}
          retrying={failed.isFetching}
          requestId={
            failed.error instanceof ApiError
              ? failed.error.requestId
              : undefined
          }
        />
      </>
    );
  } else if (booking.isPending || stay.isPending) {
    content = <LoadingBooking />;
  } else {
    content = <Confirmation booking={booking.data} stay={stay.data} />;
  }

  return <div className="mx-auto w-full max-w-xl">{content}</div>;
}
