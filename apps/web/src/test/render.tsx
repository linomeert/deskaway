import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

interface Options {
  // The route pattern the screen is mounted on, e.g. "/checkout/:id".
  path?: string;
  // The URL the test starts at, e.g. "/checkout/stay-1?checkIn=…".
  route?: string;
}

// Where the app navigated to, so a test can see it left the screen.
function Elsewhere() {
  const { pathname } = useLocation();
  return <p>Navigated to {pathname}</p>;
}

// One screen with a fresh query client (no retries) and a memory router.
// Root is skipped on purpose: its client retries 5xx, which slows error tests.
export function renderWithProviders(
  ui: ReactElement,
  { path = "/", route = path }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<Elsewhere />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}
