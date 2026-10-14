import type { StayDetail } from "@deskaway/shared";
import { type Ref, useId, useState } from "react";
import type { UseFormRegister } from "react-hook-form";
import { Button } from "../../components/Button";
import { Field, Input, Select, Textarea } from "../../components/Field";
import { AlertIcon } from "../../components/icons";
import { formatDateRange, formatGuests } from "../../lib/format";
import type { BookingState } from "../stay/PricePanel";
import type { useStayParams } from "../stay/useStayParams";
import { type CheckoutInput, MAX_LENGTHS } from "./checkoutSchema";

function noteError(error: { type?: string } | undefined): string | undefined {
  if (!error) return undefined;
  return `Use ${String(MAX_LENGTHS.note)} characters or fewer`;
}

// Why Continue can't go on yet; the API decides, this only words it.
export function tripProblem(state: BookingState): string | undefined {
  switch (state.status) {
    case "no-dates":
      return "Add your check-in and check-out dates.";
    case "unavailable":
      return state.reason;
    case "error":
      return "We couldn't check these dates. Try again in the price details.";
    case "loading":
    case "bookable":
      return undefined;
  }
}

// The line shown once the trip step is done.
export function tripSummary(
  params: ReturnType<typeof useStayParams>,
  note: unknown,
): string | undefined {
  if (!params.checkIn || !params.checkOut) return undefined;
  return [
    formatDateRange(params.checkIn, params.checkOut),
    formatGuests(params.guests),
    typeof note === "string" && note.trim() ? `Note: “${note.trim()}”` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

interface TripStepProps {
  stay: StayDetail;
  state: BookingState;
  params: ReturnType<typeof useStayParams>;
  register: UseFormRegister<CheckoutInput>;
  noteFieldError: { type?: string } | undefined;
  // Shown after a Continue that could not go on.
  showProblem: boolean;
  checkInRef: Ref<HTMLInputElement>;
  onContinue: () => void;
}

export function TripStep({
  stay,
  state,
  params,
  register,
  noteFieldError,
  showProblem,
  checkInRef,
  onContinue,
}: TripStepProps) {
  const problemId = useId();
  const guestsId = useId();
  // Local until both dates are set, then written to the URL so the quote follows.
  const [checkIn, setCheckIn] = useState(params.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(params.checkOut ?? "");

  const changeDates = (nextIn: string, nextOut: string) => {
    setCheckIn(nextIn);
    setCheckOut(nextOut);
    params.setDates(
      nextIn && nextOut ? { checkIn: nextIn, checkOut: nextOut } : undefined,
    );
  };

  // Unavailable dates are explained right away; missing ones after Continue.
  const problem =
    state.status === "unavailable" || showProblem
      ? tripProblem(state)
      : undefined;

  const guestOptions = Array.from(
    { length: Math.max(stay.maxGuests, params.guests) },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Dates</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Check-in">
            {(props) => (
              <Input
                type="date"
                ref={checkInRef}
                value={checkIn}
                onChange={(event) => {
                  changeDates(event.target.value, checkOut);
                }}
                {...props}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? problemId : undefined}
              />
            )}
          </Field>
          <Field label="Check-out">
            {(props) => (
              <Input
                type="date"
                value={checkOut}
                onChange={(event) => {
                  changeDates(checkIn, event.target.value);
                }}
                {...props}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? problemId : undefined}
              />
            )}
          </Field>
        </div>
        {problem && (
          <p
            id={problemId}
            className="flex items-center gap-1.5 text-sm text-danger"
          >
            <AlertIcon className="size-4 shrink-0" />
            <span className="sr-only">Error:</span> {problem}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={guestsId} className="text-sm font-semibold text-ink">
          Guests
        </label>
        <Select
          id={guestsId}
          value={params.guests}
          onChange={(event) => {
            params.setGuests(Number(event.target.value));
          }}
          className="sm:w-1/2"
        >
          {guestOptions.map((count) => (
            <option key={count} value={count}>
              {formatGuests(count)}
            </option>
          ))}
        </Select>
      </div>

      <Field
        label="Note about your call hours (optional)"
        hint="For example: I take calls 9–17, so a quiet desk then helps."
        error={noteError(noteFieldError)}
      >
        {(props) => (
          <Textarea className="min-h-24" {...props} {...register("note")} />
        )}
      </Field>

      <Button
        onClick={onContinue}
        loading={state.status === "loading"}
        className="self-start"
      >
        Continue
      </Button>
    </div>
  );
}
