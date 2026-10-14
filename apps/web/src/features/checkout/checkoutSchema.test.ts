import { describe, expect, it } from "vitest";
import { CheckoutSchema, DEMO_CARD, EMPTY_CHECKOUT } from "./checkoutSchema";

const VALID = {
  ...EMPTY_CHECKOUT,
  guestName: "Anna Peeters",
  guestEmail: "anna@example.com",
  cardName: "Anna Peeters",
  ...DEMO_CARD,
};

function errorsFor(patch: Partial<typeof VALID>): string[] {
  const result = CheckoutSchema.safeParse({ ...VALID, ...patch });
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join("."));
}

describe("CheckoutSchema", () => {
  it("accepts a card number with or without spaces", () => {
    expect(errorsFor({ cardNumber: "4242 4242 4242 4242" })).toEqual([]);
    expect(errorsFor({ cardNumber: "4242424242424242" })).toEqual([]);
  });

  it.each(["4242 4242 4242 424", "42424242424242424", "4242-4242-4242-4242"])(
    "rejects card number %s",
    (cardNumber) => {
      expect(errorsFor({ cardNumber })).toEqual(["cardNumber"]);
    },
  );

  it.each(["01/27", "12/30"])("accepts expiry %s", (expiry) => {
    expect(errorsFor({ expiry })).toEqual([]);
  });

  it.each(["13/30", "00/30", "1230", "1/30", "12/2030"])(
    "rejects expiry %s",
    (expiry) => {
      expect(errorsFor({ expiry })).toEqual(["expiry"]);
    },
  );

  it("accepts a 3-digit CVC", () => {
    expect(errorsFor({ cvc: "007" })).toEqual([]);
  });

  it.each(["12", "1234", "12a"])("rejects CVC %s", (cvc) => {
    expect(errorsFor({ cvc })).toEqual(["cvc"]);
  });

  it("turns empty optional fields into undefined", () => {
    const result = CheckoutSchema.parse({
      ...VALID,
      note: "",
      company: "  ",
      vatNumber: "",
    });

    expect(result.note).toBeUndefined();
    expect(result.company).toBeUndefined();
    expect(result.vatNumber).toBeUndefined();
  });

  it("keeps filled optional fields", () => {
    const result = CheckoutSchema.parse({
      ...VALID,
      company: "Acme",
      vatNumber: "BE0123456789",
    });

    expect(result.company).toBe("Acme");
    expect(result.vatNumber).toBe("BE0123456789");
  });

  it("rejects an invalid email", () => {
    expect(errorsFor({ guestEmail: "anna@" })).toEqual(["guestEmail"]);
  });
});
