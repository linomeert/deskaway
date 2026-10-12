import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { SearchIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  // Buttons that get the user out of the empty state, e.g. "Clear filters".
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-3 rounded-lg bg-surface-alt px-6 py-10 text-center",
        className,
      )}
    >
      <SearchIcon className="size-8 text-accent" />
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="max-w-md text-muted">{description}</p>}
      {actions && (
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      )}
    </div>
  );
}
