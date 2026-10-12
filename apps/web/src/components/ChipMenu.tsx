import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cx } from "../lib/cx";
import { chipClasses } from "./Chip";
import { CheckIcon, ChevronDownIcon } from "./icons";

interface ChipMenuOption<T extends string> {
  value: T;
  label: string;
}

interface ChipMenuProps<T extends string> {
  // Shown as "<label>: <selected>", and names the menu.
  label: string;
  icon?: ReactNode;
  value: T;
  options: ChipMenuOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

interface Position {
  top: number;
  left: number;
}

const GAP_PX = 8;

// Single choice from a short list, styled as a chip (WAI-ARIA menu button with
// radio items). The panel is a native popover, so it renders in the top layer
// and a scrolling chip row can't clip it.
export function ChipMenu<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  className,
}: ChipMenuProps<T>) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Light dismiss closes the menu on pointerdown, before the chip's click
  // would open it again; remember whether it was open.
  const wasOpenOnPointerDown = useRef(false);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;
    const rect = button.getBoundingClientRect();
    const width = menu.offsetWidth;
    // Right-align with the chip when the menu would run off the screen.
    const left =
      rect.left + width > window.innerWidth - GAP_PX
        ? Math.max(GAP_PX, rect.right - width)
        : rect.left;
    setPosition({ top: rect.bottom + GAP_PX, left });
  }, []);

  // Only touch the popover API on a real open/close, never on mount.
  const shown = useRef(false);
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu || open === shown.current) return;
    shown.current = open;
    if (open) {
      menu.showPopover();
      place();
    } else {
      menu.hidePopover();
    }
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  function openAt(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function close({ returnFocus }: { returnFocus: boolean }) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function choose(option: ChipMenuOption<T>) {
    close({ returnFocus: true });
    if (option.value !== value) onChange(option.value);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        event.preventDefault();
        openAt(selectedIndex);
        break;
      case "ArrowUp":
        event.preventDefault();
        openAt(options.length - 1);
        break;
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(activeIndex >= last ? 0 : activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(activeIndex <= 0 ? last : activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Escape":
        event.preventDefault();
        close({ returnFocus: true });
        break;
      case "Tab":
        close({ returnFocus: false });
        break;
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onPointerDown={() => {
          wasOpenOnPointerDown.current = open;
        }}
        onClick={() => {
          const wasOpen = wasOpenOnPointerDown.current || open;
          wasOpenOnPointerDown.current = false;
          if (wasOpen) close({ returnFocus: false });
          else openAt(selectedIndex);
        }}
        onKeyDown={handleButtonKeyDown}
        className={cx(
          chipClasses,
          open ? "border-ink bg-surface-alt" : "border-border hover:border-ink",
          className,
        )}
      >
        {icon}
        <span>
          {label}: <span className="font-semibold">{selected?.label}</span>
        </span>
        <ChevronDownIcon
          className={cx(
            "size-4 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={label}
        tabIndex={-1}
        popover="auto"
        onToggle={(event) => {
          // Click outside or the browser's own Esc handling.
          if (event.newState === "closed") setOpen(false);
        }}
        onKeyDown={handleMenuKeyDown}
        style={{ top: position.top, left: position.left }}
        className="fixed inset-auto m-0 min-w-48 rounded-lg border border-border bg-surface py-2 text-ink shadow-float"
      >
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={checked}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => {
                choose(option);
              }}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
              className={cx(
                "flex h-11 w-full items-center gap-3 px-4 text-left text-sm whitespace-nowrap",
                "hover:bg-surface-alt focus-visible:bg-surface-alt focus-visible:-outline-offset-2",
                checked && "font-semibold",
              )}
            >
              <CheckIcon
                className={cx(
                  "size-4 shrink-0 text-primary",
                  !checked && "invisible",
                )}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
