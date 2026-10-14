import { Link, type RouteObject } from "react-router";
import { BookingPage } from "../features/booking/BookingPage";
import { CheckoutPage } from "../features/checkout/CheckoutPage";
import { SearchPage } from "../features/search/SearchPage";
import { StayPage } from "../features/stay/StayPage";
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
        element: <CheckoutPage />,
      },
      {
        path: "bookings/:id",
        element: <BookingPage />,
      },
      ...devRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
