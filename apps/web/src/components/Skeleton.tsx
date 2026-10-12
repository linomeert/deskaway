import { cx } from "../lib/cx";

// Purely visual. The loading region around it sets aria-busy and has
// visually hidden "Loading…" text for screen readers.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "animate-pulse rounded-md bg-border motion-reduce:animate-none",
        className,
      )}
    />
  );
}
