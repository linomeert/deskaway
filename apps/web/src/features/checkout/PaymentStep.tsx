import type { Ref } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "../../components/Button";
import { ErrorState } from "../../components/ErrorState";
import { Field, Input } from "../../components/Field";
import { ApiError } from "../../lib/api";
import type { CheckoutInput } from "./checkoutSchema";

interface PaymentStepProps {
  register: UseFormRegister<CheckoutInput>;
  errors: FieldErrors<CheckoutInput>;
  onFillDemoCard: () => void;
  submitting: boolean;
  // Any API error from POST /bookings, shown with the server's message.
  submitError: Error | null;
  errorRef: Ref<HTMLDivElement>;
}

export function PaymentStep({
  register,
  errors,
  onFillDemoCard,
  submitting,
  submitError,
  errorRef,
}: PaymentStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start gap-3 rounded-md bg-surface-alt p-4">
        <p>
          <strong>Demo only, no real payment.</strong> Any 16 digits work, and
          card details never leave this page.
        </p>
        <Button variant="secondary" size="sm" onClick={onFillDemoCard}>
          Fill demo card
        </Button>
      </div>

      {/* autoComplete off: browsers should not offer real saved cards here. */}
      <Field label="Card number" error={errors.cardNumber?.message}>
        {(props) => (
          <Input
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234 5678 9012 3456"
            {...props}
            {...register("cardNumber")}
          />
        )}
      </Field>
      <Field label="Name on card" error={errors.cardName?.message}>
        {(props) => (
          <Input autoComplete="off" {...props} {...register("cardName")} />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Expiry date" error={errors.expiry?.message}>
          {(props) => (
            <Input
              autoComplete="off"
              placeholder="MM/YY"
              {...props}
              {...register("expiry")}
            />
          )}
        </Field>
        <Field label="CVC" error={errors.cvc?.message}>
          {(props) => (
            <Input
              inputMode="numeric"
              autoComplete="off"
              {...props}
              {...register("cvc")}
            />
          )}
        </Field>
      </div>

      {submitError && (
        <div ref={errorRef} tabIndex={-1} className="rounded-lg">
          <ErrorState
            title="We couldn't confirm your booking"
            message={submitError.message}
            requestId={
              submitError instanceof ApiError
                ? submitError.requestId
                : undefined
            }
          />
        </div>
      )}

      <Button type="submit" loading={submitting} className="w-full">
        Confirm booking
      </Button>
    </div>
  );
}
