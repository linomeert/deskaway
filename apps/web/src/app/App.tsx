import { Outlet, useMatch } from "react-router";
import { Header } from "../components/Header";
import { HeaderSearch } from "../features/search/HeaderSearch";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted sm:px-6 lg:px-10">
        Deskaway v{import.meta.env.VITE_APP_VERSION}
      </div>
    </footer>
  );
}

export function App() {
  // Checkout keeps the header calm: no search there.
  const inCheckout = useMatch("/checkout/*") !== null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header center={inCheckout ? undefined : <HeaderSearch />} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
