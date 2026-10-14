import { type ReactNode, type Ref, useId } from "react";
import { cx } from "../../lib/cx";

export type StepStatus = "done" | "open" | "next";

interface CheckoutStepProps {
  number: number;
  title: string;
  status: StepStatus;
  headingRef: Ref<HTMLHeadingElement>;
  // One line shown once the step is done, e.g. "2–16 Nov · 1 guest".
  summary?: ReactNode;
  onEdit: () => void;
  children: ReactNode;
}

// One section of the stacked checkout: open, collapsed with Edit, or upcoming.
export function CheckoutStep({
  number,
  title,
  status,
  headingRef,
  summary,
  onEdit,
  children,
}: CheckoutStepProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          aria-current={status === "open" ? "step" : undefined}
          className={cx(
            "rounded-md text-lg font-semibold",
            status === "open" ? "text-ink" : "text-muted",
          )}
        >
          {number}. {title}
        </h2>
        {status === "done" && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md font-semibold text-ink underline underline-offset-4"
          >
            Edit<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>
      {status === "done" && summary && <p className="text-muted">{summary}</p>}
      {status === "open" && children}
    </section>
  );
}
