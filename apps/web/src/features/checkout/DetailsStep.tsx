import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "../../components/Button";
import { Field, Input } from "../../components/Field";
import { type CheckoutInput, MAX_LENGTHS } from "./checkoutSchema";

// The shared schema's messages are written for developers; these are for guests.
// Takes any error with a type: the optional fields' errors are typed loosely.
function tooLongOr(
  error: { type?: string } | undefined,
  max: number,
  otherwise: string,
): string | undefined {
  if (!error) return undefined;
  if (error.type === "too_big") return `Use ${String(max)} characters or fewer`;
  return otherwise;
}

interface DetailsStepProps {
  register: UseFormRegister<CheckoutInput>;
  errors: FieldErrors<CheckoutInput>;
  onContinue: () => void;
}

export function DetailsStep({
  register,
  errors,
  onContinue,
}: DetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Field
        label="Full name"
        error={tooLongOr(
          errors.guestName,
          MAX_LENGTHS.guestName,
          "Enter your full name",
        )}
      >
        {(props) => (
          <Input autoComplete="name" {...props} {...register("guestName")} />
        )}
      </Field>

      <Field
        label="Email"
        hint="We send the confirmation here (demo, nothing is sent)."
        error={
          errors.guestEmail
            ? "Enter a valid email, like name@example.com"
            : undefined
        }
      >
        {(props) => (
          <Input
            type="email"
            autoComplete="email"
            {...props}
            {...register("guestEmail")}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company (optional)"
          error={tooLongOr(
            errors.company,
            MAX_LENGTHS.company,
            "Check the company name",
          )}
        >
          {(props) => (
            <Input
              autoComplete="organization"
              {...props}
              {...register("company")}
            />
          )}
        </Field>
        <Field
          label="VAT number (optional)"
          error={tooLongOr(
            errors.vatNumber,
            MAX_LENGTHS.vatNumber,
            "Check the VAT number",
          )}
        >
          {(props) => (
            <Input autoComplete="off" {...props} {...register("vatNumber")} />
          )}
        </Field>
      </div>

      <Button onClick={onContinue} className="self-start">
        Continue
      </Button>
    </div>
  );
}
