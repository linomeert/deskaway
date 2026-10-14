import type { StayPage, StaySearchQuery } from "@deskaway/shared";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { ApiError } from "../../lib/api";
import { cx } from "../../lib/cx";
import { FilterBar } from "./FilterBar";
import { StayCard } from "./StayCard";
import { STAY_GRID, StayCardSkeletonGrid } from "./StayCardSkeletonGrid";
import { useStaySearchParams } from "./useStaySearchParams";
import { useStays } from "./useStays";

const SKELETON_COUNT = 8;

function placeName(query: StaySearchQuery): string {
  return query.city ?? "the Benelux";
}

function resultsLine(data: StayPage | undefined, place: string): string {
  if (!data) return "";
  if (data.total === 0) return `No stays in ${place}`;
  return `${String(data.total)} ${data.total === 1 ? "stay" : "stays"} in ${place}`;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}

function Pagination({ page, pageCount, onPage }: PaginationProps) {
  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-center gap-4 pt-10"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => {
          onPage(page - 1);
        }}
      >
        Previous
      </Button>
      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => {
          onPage(page + 1);
        }}
      >
        Next
      </Button>
    </nav>
  );
}

export function SearchPage() {
  const { query, setQuery, clearAll } = useStaySearchParams();
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useStays(query);
  const place = placeName(query);

  let content;
  if (isPending) {
    content = (
      <StayCardSkeletonGrid count={SKELETON_COUNT} label="Loading stays…" />
    );
  } else if (isError) {
    content = (
      <ErrorState
        title="We couldn't load stays"
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
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        title="No stays match all your filters"
        description={
          query.minWifi === undefined
            ? "Try another workspace type, or clear the search to see every stay."
            : "Fast wifi narrows things down a lot. Try a lower wifi minimum."
        }
        actions={
          <>
            {query.minWifi !== undefined && (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery({ minWifi: undefined });
                }}
              >
                Remove wifi filter
              </Button>
            )}
            <Button variant="ghost" onClick={clearAll}>
              Clear all
            </Button>
          </>
        }
      />
    );
  } else {
    const pageCount = Math.ceil(data.total / data.pageSize);
    content = (
      <>
        <ul
          aria-busy={isPlaceholderData || undefined}
          className={cx(
            STAY_GRID,
            "transition-opacity",
            isPlaceholderData && "opacity-60",
          )}
        >
          {data.items.map((stay) => (
            <li key={stay.id}>
              <StayCard stay={stay} query={query} />
            </li>
          ))}
        </ul>
        {pageCount > 1 && (
          <Pagination
            page={data.page}
            pageCount={pageCount}
            onPage={(page) => {
              setQuery({ page });
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="sr-only">Stays in {place}</h1>
      <FilterBar query={query} onChange={setQuery} />
      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {isError ? "" : resultsLine(data, place)}
      </p>
      {content}
    </div>
  );
}
