import type { StaySearchQuery } from "@deskaway/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getStays } from "../../lib/api";

export function useStays(query: StaySearchQuery) {
  return useQuery({
    queryKey: ["stays", query],
    queryFn: () => getStays(query),
    // Keep the old results on screen (dimmed) while a filter change loads.
    placeholderData: keepPreviousData,
  });
}
