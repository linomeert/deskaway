import type { StayRepository } from "../repo/StayRepository";

export interface RouteDeps {
  repo: StayRepository;
  /** Today's date (YYYY-MM-DD); a function so tests can pin it. */
  today: () => string;
}

export const WRITE_RATE_LIMIT = { max: 10, timeWindow: "1 minute" };
