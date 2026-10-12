import { Link, type RouteObject } from "react-router";
import { App } from "./App";

function HomePage() {
  return (
    <>
      <h1>Deskaway</h1>
      <p>Workation stays in the Benelux.</p>
    </>
  );
}

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
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      ...devRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
