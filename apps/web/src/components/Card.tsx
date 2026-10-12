import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";

interface CardProps extends ComponentProps<"article"> {
  // Photo or other media shown on top, clipped to the card radius.
  media?: ReactNode;
}

// Borderless, photo first. No shadow: shadows are for floating elements only.
export function Card({ media, className, children, ...props }: CardProps) {
  return (
    <article className={cx("flex flex-col gap-2", className)} {...props}>
      {media && (
        <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-alt">
          {media}
        </div>
      )}
      {children}
    </article>
  );
}
