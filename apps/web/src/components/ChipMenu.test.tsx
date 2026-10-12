import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ChipMenu } from "./ChipMenu";

// jsdom has no popover methods and hides [popover] content. The stubs mimic
// showing it by dropping the attribute; closed menus are queried with hidden: true.
beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.removeAttribute("popover");
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    this.setAttribute("popover", "auto");
  };
});

const OPTIONS = [
  { value: "workScore", label: "Work score" },
  { value: "priceAsc", label: "Price per day" },
  { value: "rating", label: "Rating" },
];

function SortMenu({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("workScore");
  return (
    <ChipMenu
      label="Sort"
      value={value}
      options={OPTIONS}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

function renderMenu() {
  const onChange = vi.fn();
  render(<SortMenu onChange={onChange} />);
  const trigger = screen.getByRole("button", { name: "Sort: Work score" });
  return { onChange, trigger };
}

describe("ChipMenu", () => {
  it("shows the selected option and starts closed", () => {
    const { trigger } = renderMenu();

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("menuitemradio", { name: "Work score", hidden: true }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("opens with ArrowDown on the checked item and moves with arrow keys", () => {
    const { trigger } = renderMenu();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "Work score", hidden: true }),
    ).toHaveFocus();

    const menu = screen.getByRole("menu", { name: "Sort", hidden: true });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(
      screen.getByRole("menuitemradio", {
        name: "Price per day",
        hidden: true,
      }),
    ).toHaveFocus();

    fireEvent.keyDown(menu, { key: "End" });
    expect(
      screen.getByRole("menuitemradio", { name: "Rating", hidden: true }),
    ).toHaveFocus();

    // Wraps around.
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(
      screen.getByRole("menuitemradio", { name: "Work score", hidden: true }),
    ).toHaveFocus();
  });

  it("selects an option, closes and returns focus to the chip", () => {
    const { onChange, trigger } = renderMenu();

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("menuitemradio", {
        name: "Price per day",
        hidden: true,
      }),
    );

    expect(onChange).toHaveBeenCalledWith("priceAsc");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleName("Sort: Price per day");
  });

  it("closes on Escape without changing the value", () => {
    const { onChange, trigger } = renderMenu();

    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.keyDown(
      screen.getByRole("menu", { name: "Sort", hidden: true }),
      {
        key: "Escape",
      },
    );

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});
