import type { ReviewCreate, ReviewSort } from "@deskaway/shared";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getReviews, postReview } from "../../lib/api";

export function useReviews(stayId: string, sort: ReviewSort) {
  return useQuery({
    queryKey: ["reviews", stayId, sort],
    queryFn: () => getReviews(stayId, sort),
    // Keep the current list on screen while the other sort order loads.
    placeholderData: keepPreviousData,
  });
}

export function useAddReview(stayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: ReviewCreate) => postReview(stayId, review),
    // The list and the averages on the stay both change.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reviews", stayId] }),
        queryClient.invalidateQueries({ queryKey: ["stay", stayId] }),
      ]),
  });
}
