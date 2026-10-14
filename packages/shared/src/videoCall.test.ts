import { describe, expect, it } from "vitest";
import { isVideoCallReady } from "./workScore";

describe("isVideoCallReady", () => {
  it("is false below 20 Mbps upload", () => {
    expect(isVideoCallReady(19)).toBe(false);
  });

  it("is true at exactly 20 Mbps upload", () => {
    expect(isVideoCallReady(20)).toBe(true);
  });

  it("is true above 20 Mbps upload", () => {
    expect(isVideoCallReady(21)).toBe(true);
  });
});
