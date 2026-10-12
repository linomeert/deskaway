import { type ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "./Button";
import { CloseIcon } from "./icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Native modal <dialog>: showModal() makes the rest of the page inert (focus
// trap) and handles Esc. We keep it controlled and return focus ourselves.
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;

    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();

    return () => {
      dialog.close();
      opener?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: let the parent decide, so `open` stays the source of truth.
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-11/12 max-w-lg rounded-lg bg-surface text-ink shadow-float backdrop:bg-ink/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close"
          onClick={onClose}
          className="-mr-3"
        >
          <CloseIcon className="size-5" />
        </Button>
      </div>
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      )}
    </dialog>
  );
}
