import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";

// Pill-shaped filter controls (search filters, sort).
export const chipClasses =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-surface px-3 text-sm whitespace-nowrap text-ink transition-colors";

const OFF = "border-border hover:border-ink";
const ON = "border-ink bg-surface-alt font-semibold";

interface ChipButtonProps extends ComponentProps<"button"> {
  // Set for toggles (rendered as aria-pressed); leave out for plain actions.
  pressed?: boolean;
  icon?: ReactNode;
}

export function ChipButton({
  pressed,
  icon,
  type = "button",
  className,
  children,
  ...props
}: ChipButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cx(chipClasses, pressed === true ? ON : OFF, className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface ChipRadioProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
}

// A real radio input (arrow keys move within the group), styled as a chip.
// Put a group in a fieldset with a legend.
export function ChipRadio({ label, className, ...props }: ChipRadioProps) {
  return (
    <label
      className={cx(
        chipClasses,
        // relative: keeps the sr-only (absolute) input inside the chip, so it
        // can't escape a scrolling chip row and widen the page.
        "relative cursor-pointer border-border hover:border-ink",
        "has-checked:border-ink has-checked:bg-surface-alt has-checked:font-semibold",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        className,
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      {label}
    </label>
  );
}
