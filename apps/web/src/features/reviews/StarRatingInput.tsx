import type { ReviewCreate } from "@deskaway/shared";
import { useId } from "react";
import { type Control, useController } from "react-hook-form";
import { AlertIcon, StarIcon } from "../../components/icons";

export type RatingField =
  "rating" | "wifiRating" | "workspaceRating" | "noiseRating";

const STARS = [1, 2, 3, 4, 5];

// React Hook Form types the value as a number, but it is undefined until a
// star is picked; the parameter type keeps that visible.
function isFilled(star: number, value: number | undefined): boolean {
  return value !== undefined && star <= value;
}

interface StarRatingInputProps {
  name: RatingField;
  control: Control<ReviewCreate>;
  legend: string;
  // What 1 and 5 mean, e.g. "1 = very noisy, 5 = very quiet".
  hint?: string;
}

// A real radio group (arrow keys move, Space picks), drawn as five stars.
export function StarRatingInput({
  name,
  control,
  legend,
  hint,
}: StarRatingInputProps) {
  const { field, fieldState } = useController({ name, control });
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, fieldState.error && errorId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <fieldset aria-describedby={describedBy} className="flex flex-col gap-1">
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="-ml-2 flex">
        {STARS.map((star) => (
          <label
            key={star}
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-md text-ink has-focus-visible:outline-2 has-focus-visible:outline-primary"
          >
            <input
              ref={star === 1 ? field.ref : undefined}
              type="radio"
              name={field.name}
              value={star}
              checked={field.value === star}
              onChange={() => {
                field.onChange(star);
              }}
              onBlur={field.onBlur}
              className="sr-only"
            />
            <StarIcon filled={isFilled(star, field.value)} className="size-7" />
            <span className="sr-only">
              {star === 1 ? "1 star" : `${String(star)} stars`}
            </span>
          </label>
        ))}
      </div>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {fieldState.error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-sm text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          <span className="sr-only">Error:</span> Choose a rating
        </p>
      )}
    </fieldset>
  );
}
