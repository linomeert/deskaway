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

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
