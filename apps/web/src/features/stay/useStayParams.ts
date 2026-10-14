import type { DateRange } from "@deskaway/shared";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { parseStaySearch } from "../search/useStaySearchParams";

export interface StayParams {
  checkIn: string | undefined;
  checkOut: string | undefined;
  guests: number;
}

// /checkout/:id?checkIn&checkOut&guests, same rules as the search card links.
export function checkoutHref(id: string, params: StayParams): string {
  const search = new URLSearchParams();
  if (params.checkIn && params.checkOut) {
    search.set("checkIn", params.checkIn);
    search.set("checkOut", params.checkOut);
  }
  if (params.guests > 1) search.set("guests", String(params.guests));
  const query = search.toString();
  return `/checkout/${encodeURIComponent(id)}${query ? `?${query}` : ""}`;
}

// Dates and guests live in the URL, so a stay link can be shared as is.
// Updates replace the history entry and keep any other params (_fail, _delay).
export function useStayParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo((): StayParams => {
    const { checkIn, checkOut, guests } = parseStaySearch(searchParams);
    return { checkIn, checkOut, guests };
  }, [searchParams]);

  const setDates = useCallback(
    (range: DateRange | undefined) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (range) {
            next.set("checkIn", range.checkIn);
            next.set("checkOut", range.checkOut);
          } else {
            next.delete("checkIn");
            next.delete("checkOut");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setGuests = useCallback(
    (guests: number) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (guests > 1) next.set("guests", String(guests));
          else next.delete("guests");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { ...params, setDates, setGuests };
}
