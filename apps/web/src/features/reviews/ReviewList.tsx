import type { Review, ReviewSort } from "@deskaway/shared";
import { type Ref, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { ChipRadio } from "../../components/Chip";
import { ErrorState } from "../../components/ErrorState";
import { StarIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { useReviews } from "./queries";

const PREVIEW_COUNT = 4;

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "rating", label: "Highest rated" },
];

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// ISO dates are calendar days, so format them in UTC to avoid shifting a day.
function formatMonth(isoDate: string): string {
  return monthYear.format(new Date(`${isoDate}T00:00:00Z`));
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-ink">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= rating} className="size-3.5" />
      ))}
      <span className="sr-only">Rated {rating} out of 5</span>
    </span>
  );
}

function ReviewItem({
  review,
  ref,
}: {
  review: Review;
  ref?: Ref<HTMLElement>;
}) {
  return (
    // tabIndex -1: focus lands here after the review is added.
    <article ref={ref} tabIndex={-1} className="flex flex-col gap-2 rounded-md">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-primary"
        >
          {review.authorName.charAt(0).toUpperCase()}
        </span>
        <div>
          <h3 className="font-semibold">{review.authorName}</h3>
          <p className="text-sm text-muted">
            <time dateTime={review.createdAt}>
              {formatMonth(review.createdAt)}
            </time>
          </p>
        </div>
      </div>
      <Stars rating={review.rating} />
      <p className="whitespace-pre-line">{review.text}</p>
    </article>
  );
}

function LoadingReviews() {
  return (
    <div aria-busy="true" className="grid gap-8 sm:grid-cols-2">
      <span className="sr-only">Loading reviews…</span>
      {[1, 2].map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

// The just-added review goes first, whatever the sort, so it can be seen and focused.
function pinFirst(reviews: Review[], id: string | undefined): Review[] {
  const pinned = reviews.find((review) => review.id === id);
  if (!pinned || reviews[0] === pinned) return reviews;
  return [pinned, ...reviews.filter((review) => review !== pinned)];
}

interface ReviewListProps {
  stayId: string;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  newReviewId: string | undefined;
}

export function ReviewList({
  stayId,
  sort,
  onSortChange,
  newReviewId,
}: ReviewListProps) {
  const { data, error, isPending, isError, isFetching, refetch } = useReviews(
    stayId,
    sort,
  );
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const newReviewRef = useRef<HTMLElement>(null);

  const reviews = pinFirst(data ?? [], newReviewId);
  const hasNewReview = reviews.some((review) => review.id === newReviewId);

  // An effect, not a callback ref: it runs after the Dialog's cleanup has
  // returned focus to "Write a review", so this focus wins.
  useEffect(() => {
    if (hasNewReview) newReviewRef.current?.focus();
  }, [newReviewId, hasNewReview]);

  if (isPending) return <LoadingReviews />;

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load the reviews"
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
    );
  }

  if (reviews.length === 0) {
    return <p className="text-muted">No reviews yet.</p>;
  }

  const visible = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Sort reviews</legend>
        {SORT_OPTIONS.map((option) => (
          <ChipRadio
            key={option.value}
            name="review-sort"
            value={option.value}
            label={option.label}
            checked={sort === option.value}
            onChange={() => {
              onSortChange(option.value);
            }}
          />
        ))}
      </fieldset>

      <ul
        id={listId}
        aria-busy={isFetching || undefined}
        className="grid gap-8 sm:grid-cols-2"
      >
        {visible.map((review) => (
          <li key={review.id}>
            <ReviewItem
              review={review}
              ref={review.id === newReviewId ? newReviewRef : undefined}
            />
          </li>
        ))}
      </ul>

      {reviews.length > PREVIEW_COUNT && (
        <div>
          <Button
            variant="secondary"
            aria-expanded={showAll}
            aria-controls={listId}
            onClick={() => {
              setShowAll((value) => !value);
            }}
          >
            {showAll
              ? "Show fewer reviews"
              : `Show all ${String(reviews.length)} reviews`}
          </Button>
        </div>
      )}
    </div>
  );
}
