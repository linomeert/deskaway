import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "./schemas";

describe("HealthResponseSchema", () => {
  it("accepts a healthy response", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      version: "1.2.3",
    });
    expect(result.success).toBe(true);
  });

  it("rejects any status other than ok", () => {
    const result = HealthResponseSchema.safeParse({
      status: "down",
      version: "1.2.3",
    });
    expect(result.success).toBe(false);
  });
});
