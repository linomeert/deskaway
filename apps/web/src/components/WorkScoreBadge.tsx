import { type WorkScoreBand, workScoreBand } from "@deskaway/shared";
import { cx } from "../lib/cx";
import { DeskIcon } from "./icons";

const BAND_STYLES: Record<WorkScoreBand, string> = {
  excellent: "bg-primary text-surface",
  good: "bg-accent-soft text-primary",
  fair: "bg-surface-alt text-ink",
};

interface WorkScoreBadgeProps {
  // 0-100, computed by the API.
  score: number;
  className?: string;
}

// Colour follows the band, but the number is always shown.
export function WorkScoreBadge({ score, className }: WorkScoreBadgeProps) {
  const band = workScoreBand(score);

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold",
        BAND_STYLES[band],
        className,
      )}
    >
      <DeskIcon
        className={cx("size-4", band === "excellent" && "text-accent")}
      />
      <span aria-hidden="true">
        Work score <span className="tabular-nums">{score}</span>
      </span>
      <span className="sr-only">
        Work score {score} out of 100, {band}
      </span>
    </span>
  );
}
