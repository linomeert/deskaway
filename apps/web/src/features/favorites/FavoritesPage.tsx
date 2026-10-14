import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { StayCard } from "../search/StayCard";
import { isNotFound, toSummary, useFavoriteStays } from "./queries";
import { useFavorites } from "./useFavorites";

const GRID = "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4";
const MAX_SKELETONS = 8;
// Favorites have no dates; the stay page asks for them.
const NO_DATES = { guests: 1 };

const START_EXPLORING =
  "inline-flex h-11 items-center justify-center rounded-md border border-muted bg-surface px-5 font-semibold text-ink hover:bg-surface-alt";

function LoadingGrid({ count }: { count: number }) {
  return (
    <div aria-busy="true" className={GRID}>
      <span className="sr-only">Loading favorites…</span>
      {Array.from({ length: Math.min(count, MAX_SKELETONS) }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

function NoFavorites() {
  return (
    <EmptyState
      title="No favorites yet"
      description="Tap the heart on a stay to save it here."
      actions={
        <Link to="/" className={START_EXPLORING}>
          Start exploring
        </Link>
      }
    />
  );
}

export function FavoritesPage() {
  const { ids, remove } = useFavorites();
  const entries = useFavoriteStays(ids);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const staleIds = entries
    .filter((entry) => isNotFound(entry.result.error))
    .map((entry) => entry.id);
  const failed = entries.filter(
    (entry) => entry.result.isError && !isNotFound(entry.result.error),
  );
  const stays = entries.flatMap((entry) =>
    entry.result.data ? [entry.result.data] : [],
  );

  // Forget stays that no longer exist, so the header count matches the cards.
  // Only on 404: offline or server errors keep every id.
  useEffect(() => {
    for (const id of staleIds) remove(id);
  }, [staleIds, remove]);

  // An unsaved card unmounts with its own status message and the focused
  // button, so the page announces the removal and takes focus instead.
  // Counting visible cards keeps pruned stale ids silent.
  const [visibleCount, setVisibleCount] = useState(stays.length);
  const [removals, setRemovals] = useState(0);
  if (stays.length !== visibleCount) {
    setVisibleCount(stays.length);
    if (stays.length < visibleCount) setRemovals(removals + 1);
  }

  useEffect(() => {
    if (removals > 0 && document.activeElement === document.body) {
      headingRef.current?.focus();
    }
  }, [removals]);

  let content;
  if (ids.length === 0) {
    content = <NoFavorites />;
  } else if (entries.some((entry) => entry.result.isPending)) {
    content = <LoadingGrid count={ids.length} />;
  } else if (failed.length > 0) {
    const [first] = failed;
    const error = first?.result.error;
    content = (
      <ErrorState
        title="We couldn't load your favorites"
        message={
          error instanceof ApiError && error.status === 0
            ? error.message
            : "Something went wrong on our side. Please try again."
        }
        onRetry={() => {
          for (const entry of failed) void entry.result.refetch();
        }}
        retrying={failed.some((entry) => entry.result.isFetching)}
        requestId={error instanceof ApiError ? error.requestId : undefined}
      />
    );
  } else if (stays.length === 0) {
    content = <NoFavorites />;
  } else {
    content = (
      <ul className={GRID}>
        {stays.map((stay) => (
          <li key={stay.id}>
            <StayCard stay={toSummary(stay)} query={NO_DATES} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="rounded-md text-xl font-semibold sm:text-2xl"
      >
        Favorites
      </h1>
      <span role="status" className="sr-only">
        {removals > 0 ? "Removed from favorites" : ""}
      </span>
      {content}
    </div>
  );
}
