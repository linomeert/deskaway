import type { ComponentProps } from "react";
import { cx } from "../lib/cx";
import { SpinnerIcon } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-surface enabled:hover:bg-primary-hover",
  secondary:
    "border border-muted bg-surface text-ink enabled:hover:bg-surface-alt",
  ghost: "text-primary underline-offset-4 enabled:hover:underline",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-base",
  sm: "h-9 px-3 text-sm",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: Size;
  // Disables the button and shows a spinner; the label stays so width doesn't jump.
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <SpinnerIcon className="size-4 animate-spin motion-reduce:animate-none" />
      )}
      {children}
    </button>
  );
}
