import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorState } from "../components/ErrorState";
import { Header } from "../components/Header";
import { ApiError } from "../lib/api";
import { Footer } from "./App";

// Last resort for errors thrown while rendering or loading a route.
export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${String(error.status)} ${error.statusText}`
    : "The page hit an unexpected error. Reloading usually fixes it.";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="sr-only">Something went wrong</h1>
        <ErrorState
          title="Something went wrong"
          message={message}
          onRetry={() => {
            window.location.reload();
          }}
          requestId={error instanceof ApiError ? error.requestId : undefined}
        />
      </main>
      <Footer />
    </div>
  );
}
