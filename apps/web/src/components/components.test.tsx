import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { Field, Input } from "./Field";
import { WorkScoreBadge } from "./WorkScoreBadge";

describe("Field", () => {
  it("labels the control and links the hint and error to it", () => {
    render(
      <Field
        label="Email"
        hint="For your confirmation."
        error="Enter an email."
      >
        {(control) => <Input {...control} />}
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription(
      "For your confirmation. Error: Enter an email.",
    );
    expect(input).toBeInvalid();
  });

  it("has no description or invalid state without hint or error", () => {
    render(<Field label="Name">{(control) => <Input {...control} />}</Field>);

    const input = screen.getByLabelText("Name");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).toBeValid();
  });
});

describe("Button", () => {
  it("is disabled and busy while loading, keeping its label", () => {
    render(<Button loading>Reserve</Button>);

    const button = screen.getByRole("button", { name: "Reserve" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("WorkScoreBadge", () => {
  it("shows the number and names the band for screen readers", () => {
    render(<WorkScoreBadge score={72} />);

    expect(
      screen.getByText("Work score 72 out of 100, good"),
    ).toBeInTheDocument();
    expect(screen.getByText("72")).toBeVisible();
  });
});
