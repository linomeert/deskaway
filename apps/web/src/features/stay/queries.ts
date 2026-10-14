import type { QuoteQuery } from "@deskaway/shared";
import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { getAvailability, getQuote, getStay } from "../../lib/api";

// No query until the id is known, e.g. while a booking is still loading.
export function useStay(id: string | undefined) {
  return useQuery({
    queryKey: ["stay", id],
    queryFn: id ? () => getStay(id) : skipToken,
  });
}

// No query until both dates are known.
export function useQuote(id: string, query: QuoteQuery | undefined) {
  return useQuery({
    queryKey: ["quote", id, query],
    queryFn: query ? () => getQuote(id, query) : skipToken,
  });
}

export function useAvailability(id: string, from: string, to: string) {
  return useQuery({
    queryKey: ["availability", id, from, to],
    queryFn: () => getAvailability(id, from, to),
    // Keep the old month's blocked nights while the next one loads.
    placeholderData: keepPreviousData,
  });
}
