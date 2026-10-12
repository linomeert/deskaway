import { type StaySearchQuery, StaySearchQuerySchema } from "@deskaway/shared";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

const QUERY_KEYS = Object.keys(StaySearchQuerySchema.shape);
const DEFAULT_QUERY = StaySearchQuerySchema.parse({});
const DEFAULTS = new Map<string, unknown>(Object.entries(DEFAULT_QUERY));

// The API's dev switches survive filter changes, so a demo URL keeps working.
const KEPT_PARAMS = ["_fail", "_delay"];

// Parses the URL with the shared schema. A bad value (guests=abc, city=Paris)
// is dropped on its own instead of throwing away the whole search.
export function parseStaySearch(params: URLSearchParams): StaySearchQuery {
  let raw: Record<string, string> = {};
  for (const key of QUERY_KEYS) {
    const value = params.get(key);
    if (value !== null && value !== "") raw[key] = value;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const result = StaySearchQuerySchema.safeParse(raw);
    if (result.success) return result.data;

    const invalid = new Set<string>();
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") invalid.add(key);
      // checkIn and checkOut only make sense together.
      if (key === "checkIn" || key === "checkOut") {
        invalid.add("checkIn");
        invalid.add("checkOut");
      }
    }
    raw = Object.fromEntries(
      Object.entries(raw).filter(([key]) => !invalid.has(key)),
    );
  }
  return DEFAULT_QUERY;
}

// Defaults are left out, so the URL stays short and has one form per search.
function toSearchParams(query: StaySearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries<string | number | undefined>(
    query,
  )) {
    if (value === undefined || DEFAULTS.get(key) === value) continue;
    params.set(key, String(value));
  }
  return params;
}

// Set an optional filter to undefined to remove it.
export type StaySearchPatch = Partial<StaySearchQuery>;

export function useStaySearchParams() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => parseStaySearch(searchParams), [searchParams]);

  const go = useCallback(
    (next: StaySearchQuery) => {
      const params = toSearchParams(next);
      for (const key of KEPT_PARAMS) {
        const value = searchParams.get(key);
        if (value !== null) params.set(key, value);
      }
      // Always lands on search, so the header pill works from any page.
      void navigate({ pathname: "/", search: params.toString() });
    },
    [navigate, searchParams],
  );

  // Changing anything but the page starts again at page 1.
  const setQuery = useCallback(
    (patch: StaySearchPatch) => {
      go({ ...query, page: 1, ...patch });
    },
    [go, query],
  );

  const clearAll = useCallback(() => {
    go(DEFAULT_QUERY);
  }, [go]);

  return { query, setQuery, clearAll };
}
