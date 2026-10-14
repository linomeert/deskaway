import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  availableQuote,
  stayDetail,
  stayPage,
  staySummaries,
} from "./fixtures";

// The happy path. A test swaps in failures with server.use(...).
export const handlers = [
  http.get("/api/stays", () => HttpResponse.json(stayPage(staySummaries))),
  http.get("/api/stays/:id", () => HttpResponse.json(stayDetail)),
  http.get("/api/stays/:id/quote", () => HttpResponse.json(availableQuote)),
  http.get("/api/stays/:id/availability", () =>
    HttpResponse.json({ blocked: [] }),
  ),
  http.get("/api/stays/:id/reviews", () => HttpResponse.json([])),
];

export const server = setupServer(...handlers);
