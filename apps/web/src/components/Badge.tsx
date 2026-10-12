import type { ReactNode } from "react";
import { cx } from "../lib/cx";

type Tone = "neutral" | "accent" | "success" | "danger" | "floating";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-alt text-ink",
  accent: "bg-accent-soft text-primary",
  success: "bg-surface-alt text-success",
  danger: "bg-surface-alt text-danger",
  // On top of photos.
  floating: "bg-surface text-primary shadow-float",
};

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Always has text; the tone only reinforces it.
export function Badge({
  tone = "neutral",
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
