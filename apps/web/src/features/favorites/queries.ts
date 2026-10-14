import type { StayDetail, StaySummary } from "@deskaway/shared";
import { useQueries } from "@tanstack/react-query";
import { getStay } from "../../lib/api";

// One query per saved id. Same key as useStay, so the stay page reuses the cache.
export function useFavoriteStays(ids: readonly string[]) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["stay", id],
      queryFn: () => getStay(id),
    })),
  });

  return ids.flatMap((id, index) => {
    const result = results[index];
    return result ? [{ id, result }] : [];
  });
}

// StayCard takes a search result; the details endpoint has the same data
// with the review numbers nested.
export function toSummary(stay: StayDetail): StaySummary {
  return {
    ...stay,
    averageRating: stay.reviewSummary.rating,
    reviewCount: stay.reviewSummary.count,
  };
}
