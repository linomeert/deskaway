import {
  addDays,
  CitySchema,
  type StaySearchQuery,
  todayIn,
} from "@deskaway/shared";
import { type SubmitEvent, useId, useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { Field, Input, Select } from "../../components/Field";
import type { StaySearchPatch } from "./useStaySearchParams";

interface SearchEditorProps {
  query: StaySearchQuery;
  onSearch: (patch: StaySearchPatch) => void;
  onClose: () => void;
}

const MAX_GUESTS = 16;

// Mounted only while open, so the draft starts from the current search each time.
export function SearchEditor({ query, onSearch, onClose }: SearchEditorProps) {
  const formId = useId();
  const [city, setCity] = useState<string>(query.city ?? "");
  const [checkIn, setCheckIn] = useState(query.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(query.checkOut ?? "");
  const [guests, setGuests] = useState(String(query.guests));
  const [dateError, setDateError] = useState<string>();

  const today = todayIn("Europe/Brussels");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((checkIn === "") !== (checkOut === "")) {
      setDateError("Choose both a check-in and a check-out date, or neither.");
      return;
    }
    if (checkIn !== "" && checkOut <= checkIn) {
      setDateError("Check-out must be after check-in.");
      return;
    }
    const parsedCity = CitySchema.safeParse(city);
    const parsedGuests = Number.parseInt(guests, 10);
    onSearch({
      city: parsedCity.success ? parsedCity.data : undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests:
        Number.isInteger(parsedGuests) && parsedGuests >= 1 ? parsedGuests : 1,
    });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Find the deskaway of your dreams"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Search
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        <Field label="Where would you like to go?">
          {(control) => (
            <Select
              {...control}
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
              }}
            >
              <option value="">Anywhere in the Benelux</option>
              {CitySchema.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold text-ink">When</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Check-in" error={dateError}>
              {(control) => (
                <Input
                  {...control}
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    setDateError(undefined);
                  }}
                />
              )}
            </Field>
            <Field label="Check-out">
              {(control) => (
                <Input
                  {...control}
                  type="date"
                  min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                  value={checkOut}
                  aria-invalid={dateError ? true : undefined}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    setDateError(undefined);
                  }}
                />
              )}
            </Field>
          </div>
        </fieldset>

        <Field label="How many guests are you?" hint="Number of guests">
          {(control) => (
            <Input
              {...control}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_GUESTS}
              value={guests}
              onChange={(event) => {
                setGuests(event.target.value);
              }}
            />
          )}
        </Field>
      </form>
    </Dialog>
  );
}
