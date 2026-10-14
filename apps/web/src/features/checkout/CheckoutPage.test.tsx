import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiError } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { CheckoutPage } from "./CheckoutPage";

describe("CheckoutPage", () => {
  it("shows the server's message and moves focus to it when the dates were just taken", async () => {
    server.use(
      http.post("/api/bookings", () =>
        HttpResponse.json(
          apiError("DATES_TAKEN", "These dates were just booked"),
          { status: 409 },
        ),
      ),
    );
    const { user } = renderWithProviders(<CheckoutPage />, {
      path: "/checkout/:id",
      route: "/checkout/stay-1?checkIn=2026-11-02&checkOut=2026-11-09",
    });

    // 1. Your trip: the dates come from the stay page; wait for the price check.
    const continueToDetails = await screen.findByRole("button", {
      name: "Continue",
    });
    await waitFor(() => {
      expect(continueToDetails).toBeEnabled();
    });
    await user.click(continueToDetails);

    // 2. Your details
    await user.type(screen.getByLabelText("Full name"), "Ada Peeters");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // 3. Payment: someone else books the same dates first.
    await user.click(screen.getByRole("button", { name: "Fill demo card" }));
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't confirm your booking");
    expect(alert).toHaveTextContent("These dates were just booked");
    // Focus lands on the message itself, not left behind on the page.
    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toContainElement(alert);
    });
  });
});
