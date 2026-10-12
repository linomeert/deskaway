import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "../lib/api";
import { App } from "./App";

// Retry once, and only when it can help: network errors and 5xx.
function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 1) return false;
  return (
    !(error instanceof ApiError) || error.status === 0 || error.status >= 500
  );
}

// Lives inside the route tree, so every router (browser or memory in tests)
// gets a query client.
export function Root() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
