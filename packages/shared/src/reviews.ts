import type { Review, ReviewSummary } from "./schemas";

type RatedReview = Pick<
  Review,
  "rating" | "wifiRating" | "workspaceRating" | "noiseRating"
>;

function averageOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  // One decimal, as shown in the UI.
  return Math.round((sum / values.length) * 10) / 10;
}

export function summarizeReviews(
  reviews: readonly RatedReview[],
): ReviewSummary {
  return {
    count: reviews.length,
    rating: averageOf(reviews.map((review) => review.rating)),
    wifiRating: averageOf(reviews.map((review) => review.wifiRating)),
    workspaceRating: averageOf(reviews.map((review) => review.workspaceRating)),
    noiseRating: averageOf(reviews.map((review) => review.noiseRating)),
  };
}

// Small on purpose: a demo of the moderation path, not a real filter (EN, NL, FR).
const BANNED_WORDS = new Set([
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "scam",
  "klootzak",
  "kut",
  "merde",
  "connard",
  "putain",
]);

export type ModerationResult = { ok: true } | { ok: false; word: string };

// Whole words only, so "Scunthorpe"-style false positives are avoided.
export function moderateReview(text: string): ModerationResult {
  const words = text.toLowerCase().split(/[^\p{L}]+/u);
  const word = words.find((candidate) => BANNED_WORDS.has(candidate));
  return word === undefined ? { ok: true } : { ok: false, word };
}
