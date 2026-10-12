import type { ReactNode } from "react";
import { Link } from "react-router";

interface HeaderProps {
  // Right-hand side, e.g. the Favorites link.
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="rounded-md">
          <img src="/logo.svg" alt="Deskaway home" className="h-8 w-auto" />
        </Link>
        {children}
      </div>
    </header>
  );
}
