import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import axe from "axe-core";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiError, stayPage } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { SearchPage } from "./SearchPage";

describe("SearchPage", () => {
  it("shows a loading state, then the stays", async () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByText("Loading stays…")).toBeInTheDocument();

    expect(
      await screen.findByRole("link", {
        name: "Canal loft with a standing desk",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Studio near Antwerp Central" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 stays in the Benelux")).toBeInTheDocument();
    expect(screen.queryByText("Loading stays…")).not.toBeInTheDocument();
  });

  it("shows an empty state when no stay matches", async () => {
    server.use(http.get("/api/stays", () => HttpResponse.json(stayPage([]))));
    renderWithProviders(<SearchPage />);

    expect(
      await screen.findByRole("heading", {
        name: "No stays match all your filters",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeVisible();
  });

  it("shows an error, and Try again loads the stays", async () => {
    server.use(
      http.get("/api/stays", () =>
        HttpResponse.json(apiError("INTERNAL", "Boom"), { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<SearchPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't load stays");

    // The server recovers; the guest tries again.
    server.resetHandlers();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("link", {
        name: "Canal loft with a standing desk",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations once stays are shown", async () => {
    const { container } = renderWithProviders(<SearchPage />);
    await waitForElementToBeRemoved(() => screen.queryByText("Loading stays…"));

    // jsdom has no layout or CSS, so contrast can't be measured here.
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(results.violations).toEqual([]);
  });
});
