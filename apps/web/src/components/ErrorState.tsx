import { cx } from "../lib/cx";
import { Button } from "./Button";
import { AlertIcon } from "./icons";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  // From the API error response, so a log line can be found.
  requestId?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retrying = false,
  requestId,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cx(
        "flex flex-col items-center gap-3 rounded-lg bg-surface-alt px-6 py-10 text-center",
        className,
      )}
    >
      <AlertIcon className="size-8 text-danger" />
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-md text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
      {requestId && (
        <p className="text-sm text-muted">
          Request ID: <code className="font-mono select-all">{requestId}</code>
        </p>
      )}
    </div>
  );
}
