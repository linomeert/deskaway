import { Outlet } from "react-router";
import { Header } from "../components/Header";

export function App() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </>
  );
}
