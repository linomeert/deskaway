import type { ReactNode } from "react";
import { Link } from "react-router";

interface HeaderProps {
  // Middle, e.g. the search pill. Wraps to its own full-width row on mobile.
  center?: ReactNode;
  // Right-hand side, e.g. the Favorites link.
  children?: ReactNode;
}

export function Header({ center, children }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-10">
        <Link to="/" className="rounded-md">
          <img src="/logo.svg" alt="Deskaway home" className="h-8 w-auto" />
        </Link>
        {center && (
          <div className="order-last w-full sm:order-none sm:w-auto">
            {center}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
