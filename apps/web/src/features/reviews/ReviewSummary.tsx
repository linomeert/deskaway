import type { ReviewSummary as Summary } from "@deskaway/shared";
import { StarIcon } from "../../components/icons";

const SCORES = [
  { key: "wifiRating", label: "Wifi" },
  { key: "workspaceRating", label: "Workspace" },
  // 5 = very quiet, so a high number is good like the others.
  { key: "noiseRating", label: "Quiet" },
] as const;

function formatCount(count: number): string {
  return count === 1 ? "1 review" : `${String(count)} reviews`;
}

// Heading for the reviews section, plus the work-related averages.
export function ReviewSummary({
  summary,
  headingId,
}: {
  summary: Summary;
  headingId: string;
}) {
  const { rating, count } = summary;

  if (rating === null) {
    return (
      <h2 id={headingId} className="text-lg font-semibold">
        No reviews yet
      </h2>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        id={headingId}
        className="flex items-center gap-2 text-xl font-semibold"
      >
        <StarIcon filled className="size-5" />
        <span aria-hidden="true">
          {rating.toFixed(1)} · {formatCount(count)}
        </span>
        <span className="sr-only">
          Rated {rating.toFixed(1)} out of 5 from {formatCount(count)}
        </span>
      </h2>
      <dl className="grid grid-cols-3 divide-x divide-border">
        {SCORES.map(({ key, label }) => {
          const score = summary[key];
          return (
            <div key={key} className="flex flex-col gap-1 px-4 first:pl-0">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">
                {score === null ? "–" : score.toFixed(1)}
                <span className="sr-only"> out of 5</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
