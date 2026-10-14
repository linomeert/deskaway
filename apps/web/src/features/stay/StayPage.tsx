import type { StayDetail } from "@deskaway/shared";
import { Link, useParams } from "react-router";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { StarIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { COUNTRY_NAMES, formatGuests } from "../../lib/format";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { PhotoGrid } from "./PhotoGrid";
import { PricePanel } from "./PricePanel";
import { useStay } from "./queries";
import { SaveButton } from "./SaveButton";
import { WorkSetup } from "./WorkSetup";

function LoadingStay() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading stay…</span>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="aspect-square w-full rounded-lg sm:aspect-2/1" />
      <div className="flex flex-col gap-3 lg:w-2/3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function Rating({ stay }: { stay: StayDetail }) {
  const { rating, count } = stay.reviewSummary;
  if (rating === null) return <span>New</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <StarIcon filled className="size-4" />
      <span aria-hidden="true">
        {rating.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5 from {count} reviews
      </span>
    </span>
  );
}

function StayDetails({ stay }: { stay: StayDetail }) {
  return (
    // Room at the bottom on mobile so the fixed booking bar never covers content.
    <article className="flex flex-col gap-6 pb-24 lg:pb-0">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold sm:text-2xl">{stay.name}</h1>
        <SaveButton id={stay.id} name={stay.name} />
      </div>

      <PhotoGrid photos={stay.photos} name={stay.name} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div>
            <p className="text-lg font-semibold">
              {stay.city}, {COUNTRY_NAMES[stay.country]}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 text-muted">
              <span>Up to {formatGuests(stay.maxGuests)}</span>
              <span aria-hidden="true">·</span>
              <Rating stay={stay} />
            </p>
          </div>

          <hr className="border-border" />
          <WorkSetup stay={stay} />
          <hr className="border-border" />

          <section aria-label="About this stay">
            <p className="whitespace-pre-line">{stay.description}</p>
          </section>

          <hr className="border-border" />
          <AvailabilityCalendar stay={stay} />
        </div>

        <aside aria-label="Booking" className="lg:col-span-1">
          <PricePanel stay={stay} />
        </aside>
      </div>
    </article>
  );
}

export function StayPage() {
  const { id = "" } = useParams();
  const { data, error, isPending, isError, isFetching, refetch } = useStay(id);

  if (isPending) return <LoadingStay />;

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <>
          <h1 className="sr-only">Stay not found</h1>
          <EmptyState
            title="We can't find this stay."
            description="It may have been removed, or the link is wrong."
            actions={
              <Link
                to="/"
                className="inline-flex h-11 items-center rounded-md bg-primary px-5 font-semibold text-surface hover:bg-primary-hover"
              >
                Back to search
              </Link>
            }
          />
        </>
      );
    }
    return (
      <>
        <h1 className="sr-only">Stay details</h1>
        <ErrorState
          title="We couldn't load this stay"
          message={
            error instanceof ApiError && error.status === 0
              ? error.message
              : "Something went wrong on our side. Please try again."
          }
          onRetry={() => {
            void refetch();
          }}
          retrying={isFetching}
          requestId={error instanceof ApiError ? error.requestId : undefined}
        />
      </>
    );
  }

  return <StayDetails stay={data} />;
}
