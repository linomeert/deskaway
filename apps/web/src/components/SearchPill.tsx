import { cx } from "../lib/cx";
import { SearchIcon } from "./icons";

interface SearchPillProps {
  where: string;
  when: string;
  who: string;
  onClick: () => void;
  className?: string;
}

// Summary of the current search; opens the where/when/who editor.
export function SearchPill({
  where,
  when,
  who,
  onClick,
  className,
}: SearchPillProps) {
  const segments: [label: string, value: string][] = [
    ["Where", where],
    ["When", when],
    ["Who", who],
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Search: ${where}, ${when}, ${who}. Edit search`}
      className={cx(
        "flex w-full items-center gap-3 rounded-full border border-border bg-surface py-1.5 pr-1.5 pl-5 text-left shadow-float sm:w-auto",
        className,
      )}
    >
      {/* Mobile: two lines. */}
      <span className="flex min-w-0 flex-1 flex-col sm:hidden">
        <span className="truncate text-sm font-semibold">{where}</span>
        <span className="truncate text-sm text-muted">
          {when} · {who}
        </span>
      </span>
      {/* Desktop: three segments. */}
      <span className="hidden divide-x divide-border sm:flex">
        {segments.map(([label, value]) => (
          <span key={label} className="flex flex-col px-4 first:pl-0">
            <span className="text-sm text-muted">{label}</span>
            <span className="text-sm font-semibold whitespace-nowrap">
              {value}
            </span>
          </span>
        ))}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-surface">
        <SearchIcon className="size-4" />
      </span>
    </button>
  );
}
