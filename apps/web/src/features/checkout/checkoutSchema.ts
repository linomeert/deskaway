import { BookingCreateSchema } from "@deskaway/shared";
import { z } from "zod";

const { note, guestName, guestEmail, company, vatNumber } =
  BookingCreateSchema.shape;

// Inputs give "" for an empty optional field; the API wants it left out.
function emptyAsUndefined<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema,
  );
}

// Demo only: the card fields are checked here and never sent anywhere.
const PaymentSchema = z.object({
  cardNumber: z
    .string()
    .refine((value) => /^\d{16}$/.test(value.replace(/\s/g, "")), {
      message: "Enter the 16 digits on the card",
    }),
  cardName: z.string().trim().min(1, { message: "Enter the name on the card" }),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Enter the expiry date as MM/YY",
  }),
  cvc: z.string().regex(/^\d{3}$/, {
    message: "Enter the 3 digits on the back of the card",
  }),
});

export const CheckoutSchema = z
  .object({
    note: emptyAsUndefined(note),
    guestName,
    guestEmail,
    company: emptyAsUndefined(company),
    vatNumber: emptyAsUndefined(vatNumber),
  })
  .extend(PaymentSchema.shape);

export type CheckoutInput = z.input<typeof CheckoutSchema>;
export type CheckoutValues = z.output<typeof CheckoutSchema>;
export type CheckoutField = keyof CheckoutValues;

export const MAX_LENGTHS = {
  note: note.unwrap().maxLength ?? 0,
  guestName: guestName.maxLength ?? 0,
  company: company.unwrap().maxLength ?? 0,
  vatNumber: vatNumber.unwrap().maxLength ?? 0,
};

export const STEP_FIELDS = {
  trip: ["note"],
  details: ["guestName", "guestEmail", "company", "vatNumber"],
  payment: ["cardNumber", "cardName", "expiry", "cvc"],
} satisfies Record<string, CheckoutField[]>;

export const EMPTY_CHECKOUT: CheckoutInput = {
  note: "",
  guestName: "",
  guestEmail: "",
  company: "",
  vatNumber: "",
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvc: "",
};

export const DEMO_CARD = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvc: "123",
};
