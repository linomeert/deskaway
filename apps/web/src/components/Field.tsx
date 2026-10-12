import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../lib/cx";
import { AlertIcon } from "./icons";

export interface ControlProps {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  // Render prop so any control (Input, select, textarea) gets the same wiring.
  children: (control: ControlProps) => ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-sm text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cx(
        "h-11 w-full rounded-md border border-muted bg-surface px-3 text-base text-ink placeholder:text-muted",
        "aria-invalid:border-2 aria-invalid:border-danger",
        "disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cx(
        "h-11 w-full rounded-md border border-muted bg-surface px-3 text-base text-ink",
        "aria-invalid:border-2 aria-invalid:border-danger",
        "disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
}
