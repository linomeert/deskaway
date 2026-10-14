import { Link, type RouteObject } from "react-router";
import { SearchPage } from "../features/search/SearchPage";
import { StayPage } from "../features/stay/StayPage";
import { PlaceholderPage } from "./PlaceholderPage";
import { Root } from "./Root";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <Link to="/">Back to home</Link>
    </>
  );
}

// Dev only: the import sits behind the DEV check so it is dropped from builds.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "styleguide",
        lazy: async () => {
          const { StyleguidePage } =
            await import("../features/styleguide/StyleguidePage");
          return { Component: StyleguidePage };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Root />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <SearchPage /> },
      {
        path: "stays/:id",
        element: <StayPage />,
      },
      {
        path: "checkout/:id",
        element: <PlaceholderPage title="Confirm and book" />,
      },
      {
        path: "bookings/:id",
        element: <PlaceholderPage title="Your booking" />,
      },
      ...devRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
