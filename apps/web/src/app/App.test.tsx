import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";
import { routes } from "./routes";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe("App", () => {
  it("renders the home page", async () => {
    renderAt("/");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Deskaway" }),
    ).toBeInTheDocument();
  });

  it("renders a not found page for unknown routes", async () => {
    renderAt("/does-not-exist");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
