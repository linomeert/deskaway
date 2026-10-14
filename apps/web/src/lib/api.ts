import {
  type Availability,
  AvailabilitySchema,
  ErrorResponseSchema,
  type Quote,
  type QuoteQuery,
  QuoteSchema,
  type Review,
  type ReviewCreate,
  ReviewSchema,
  type ReviewSort,
  type StayDetail,
  StayDetailSchema,
  type StayPage,
  StayPageSchema,
  type StaySearchQuery,
} from "@deskaway/shared";

// Any Zod schema fits: only safeParse is needed.
interface Parser<T> {
  safeParse: (
    input: unknown,
  ) => { success: true; data: T } | { success: false };
}

export class ApiError extends Error {
  override name = "ApiError";
  // 0 when the request never got a response.
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;
  readonly details: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

// Dev only: pass the API's demo switches (?_fail=1, ?_delay=ms) through from
// the page URL, so loading and error states can be tried in the browser.
const DEV_PARAMS = ["_fail", "_delay"];

function addDevParams(params: URLSearchParams) {
  if (!import.meta.env.DEV) return;
  const page = new URLSearchParams(window.location.search);
  for (const key of DEV_PARAMS) {
    const value = page.get(key);
    if (value !== null) params.set(key, value);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json();
    return body;
  } catch {
    return undefined;
  }
}

// Network failures, the API error shape and unexpected bodies all become ApiError.
async function send<T>(
  path: string,
  schema: Parser<T>,
  params: URLSearchParams,
  init: RequestInit,
): Promise<T> {
  addDevParams(params);
  const search = params.size > 0 ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(`${path}${search}`, init);
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Could not reach the server. Check your connection.",
    );
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;
  const body = await readJson(response);

  if (!response.ok) {
    const parsed = ErrorResponseSchema.safeParse(body);
    if (parsed.success) {
      const { code, message, details } = parsed.data.error;
      throw new ApiError(response.status, code, message, requestId, details);
    }
    throw new ApiError(
      response.status,
      "HTTP_ERROR",
      `Request failed with status ${String(response.status)}`,
      requestId,
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "The server sent an unexpected response.",
      requestId,
    );
  }
  return parsed.data;
}

export function apiGet<T>(
  path: string,
  schema: Parser<T>,
  params: URLSearchParams = new URLSearchParams(),
): Promise<T> {
  return send(path, schema, params, {
    headers: { accept: "application/json" },
  });
}

export function apiPost<T>(
  path: string,
  body: unknown,
  schema: Parser<T>,
): Promise<T> {
  return send(path, schema, new URLSearchParams(), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function getStays(query: StaySearchQuery): Promise<StayPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries<string | number | undefined>(
    query,
  )) {
    if (value !== undefined) params.set(key, String(value));
  }
  return apiGet("/api/stays", StayPageSchema, params);
}

function stayPath(id: string): string {
  return `/api/stays/${encodeURIComponent(id)}`;
}

export function getStay(id: string): Promise<StayDetail> {
  return apiGet(stayPath(id), StayDetailSchema);
}

export function getQuote(id: string, query: QuoteQuery): Promise<Quote> {
  const params = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
  });
  return apiGet(`${stayPath(id)}/quote`, QuoteSchema, params);
}

// Blocked nights in [from, to).
export function getAvailability(
  id: string,
  from: string,
  to: string,
): Promise<Availability> {
  const params = new URLSearchParams({ from, to });
  return apiGet(`${stayPath(id)}/availability`, AvailabilitySchema, params);
}

export function getReviews(id: string, sort: ReviewSort): Promise<Review[]> {
  const params = new URLSearchParams({ sort });
  return apiGet(`${stayPath(id)}/reviews`, ReviewSchema.array(), params);
}

export function postReview(id: string, review: ReviewCreate): Promise<Review> {
  return apiPost(`${stayPath(id)}/reviews`, review, ReviewSchema);
}
