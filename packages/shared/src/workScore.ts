import type { Review, Stay, WorkspaceType } from "./schemas";

type ScoredStay = Pick<
  Stay,
  "wifiDownloadMbps" | "workspaceType" | "coworkingDistanceM"
>;

// Max points out of 100 (NOTES.md: Work score).
const WEIGHTS = { wifi: 40, noise: 20, coworking: 15 };

const WORKSPACE_POINTS: Record<WorkspaceType, number> = {
  office: 25,
  desk_monitor: 20,
  desk: 15,
};

const FULL_WIFI_MBPS = 100;
const ZERO_COWORKING_M = 5000;
const NEUTRAL_NOISE = 0.5;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function noiseFactor(reviews: readonly Pick<Review, "noiseRating">[]): number {
  if (reviews.length === 0) return NEUTRAL_NOISE;
  const average =
    reviews.reduce((sum, review) => sum + review.noiseRating, 0) /
    reviews.length;
  // Map the 1-5 rating onto 0-1.
  return (average - 1) / 4;
}

function coworkingFactor(distanceM: number | undefined): number {
  if (distanceM === undefined) return 0;
  return clamp01(1 - distanceM / ZERO_COWORKING_M);
}

// 0-100, higher is better for working.
export function workScore(
  stay: ScoredStay,
  reviews: readonly Pick<Review, "noiseRating">[],
): number {
  const wifi = clamp01(stay.wifiDownloadMbps / FULL_WIFI_MBPS);

  return Math.round(
    WEIGHTS.wifi * wifi +
      WORKSPACE_POINTS[stay.workspaceType] +
      WEIGHTS.noise * noiseFactor(reviews) +
      WEIGHTS.coworking * coworkingFactor(stay.coworkingDistanceM),
  );
}

export type WorkScoreBand = "excellent" | "good" | "fair";

// Bands for display only; the number is always shown next to the band.
export function workScoreBand(score: number): WorkScoreBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  return "fair";
}

// Upload speed needed for a stable HD video call.
export const VIDEO_CALL_MIN_UPLOAD_MBPS = 20;

export function isVideoCallReady(uploadMbps: number): boolean {
  return uploadMbps >= VIDEO_CALL_MIN_UPLOAD_MBPS;
}
