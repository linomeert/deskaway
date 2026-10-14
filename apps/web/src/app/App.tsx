import { Outlet, useMatch } from "react-router";
import { Header } from "../components/Header";
import { cx } from "../lib/cx";
import {
  FavoritesHeaderLink,
  FavoritesTabBar,
} from "../features/favorites/FavoritesNav";
import { HeaderSearch } from "../features/search/HeaderSearch";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted sm:px-6 lg:px-10">
          <span>© 2026 DeskAway - Work from anywhere. Actually.</span><br />
          <span><button type="button" className="underline">Privacy</button> - <button type="button" className="underline">Terms</button></span>
        {/* Decorative: the brand name is already in the text next to it. */}
        <img src="/footerlogo.svg" alt="" className="h-12 w-auto" />
      </div>
    </footer>
  );
}

export function App() {
  // Checkout keeps the header calm: no search there.
  const inCheckout = useMatch("/checkout/*") !== null;
  // The stay page has its own fixed booking bar at the bottom on mobile.
  const onStay = useMatch("/stays/*") !== null;
  const showTabBar = !inCheckout && !onStay;

  return (
    <div
      className={cx(
        "flex min-h-screen flex-col",
        // Room for the fixed tab bar on mobile.
        showTabBar && "pb-16 sm:pb-0",
      )}
    >
      <Header center={inCheckout ? undefined : <HeaderSearch />}>
        <FavoritesHeaderLink />
      </Header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
      <Footer />
      {showTabBar && <FavoritesTabBar />}
    </div>
  );
}
