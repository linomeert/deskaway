import { NavLink } from "react-router";
import { HeartIcon, SearchIcon } from "../../components/icons";
import { cx } from "../../lib/cx";
import { useFavorites } from "./useFavorites";
import { useSavePulse } from "./useSavePulse";

interface SavePulseProps {
  // From useSavePulse: 0 means no save yet, so nothing animates.
  pulse: number;
  filled?: boolean;
  className?: string;
}

// Accent outline; filled on the Favorites page. The key remounts the element
// on each save, which restarts the animation.
export function PulsingHeart({ pulse, filled, className }: SavePulseProps) {
  return (
    <HeartIcon
      key={pulse}
      filled={filled}
      className={cx(
        "text-accent",
        className,
        pulse > 0 && "animate-save-pulse motion-reduce:animate-none",
      )}
    />
  );
}

export function FlashingCount({
  pulse,
  count,
}: {
  pulse: number;
  count: number;
}) {
  return (
    <span key={pulse} className={cx(pulse > 0 && "animate-save-flash")}>
      ({count})
    </span>
  );
}

function linkTone(isActive: boolean): string {
  return isActive ? "text-primary" : "text-ink";
}

export function FavoritesHeaderLink() {
  const { count } = useFavorites();
  const pulse = useSavePulse(count);

  return (
    <NavLink
      to="/favorites"
      className={({ isActive }) =>
        cx(
          "hidden items-center gap-2 rounded-md px-3 py-2 font-semibold hover:bg-surface-alt sm:inline-flex",
          linkTone(isActive),
        )
      }
    >
      {({ isActive }) => (
        <>
          <PulsingHeart pulse={pulse} filled={isActive} className="size-5" />
          <span>
            Favorites <FlashingCount pulse={pulse} count={count} />
          </span>
        </>
      )}
    </NavLink>
  );
}

const TAB =
  "flex flex-col items-center justify-center gap-1 rounded-md text-sm";

function tabTone(isActive: boolean): string {
  return isActive ? "font-semibold text-primary" : "text-muted";
}

// Mobile only: the header link is hidden below sm.
export function FavoritesTabBar() {
  const { count } = useFavorites();
  const pulse = useSavePulse(count);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface sm:hidden"
    >
      <div className="grid h-16 grid-cols-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) => cx(TAB, tabTone(isActive))}
        >
          <SearchIcon className="size-5" />
          Search
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) => cx(TAB, tabTone(isActive))}
        >
          {({ isActive }) => (
            <>
              <PulsingHeart
                pulse={pulse}
                filled={isActive}
                className="size-5"
              />
              <span>
                Favorites <FlashingCount pulse={pulse} count={count} />
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
