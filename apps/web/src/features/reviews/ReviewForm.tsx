import {
  type Review,
  type ReviewCreate,
  ReviewCreateSchema,
} from "@deskaway/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { type FieldError, useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { Field, Input, Textarea } from "../../components/Field";
import { AlertIcon } from "../../components/icons";
import { ApiError } from "../../lib/api";
import { useAddReview } from "./queries";
import { type RatingField, StarRatingInput } from "./StarRatingInput";

const { authorName: NAME_SCHEMA, text: TEXT_SCHEMA } = ReviewCreateSchema.shape;
const NAME_MAX = NAME_SCHEMA.maxLength ?? 0;
const TEXT_MIN = TEXT_SCHEMA.minLength ?? 0;
const TEXT_MAX = TEXT_SCHEMA.maxLength ?? 0;

const RATINGS: { name: RatingField; legend: string; hint?: string }[] = [
  { name: "rating", legend: "Overall" },
  { name: "wifiRating", legend: "Wifi" },
  { name: "workspaceRating", legend: "Workspace" },
  {
    name: "noiseRating",
    legend: "Quiet",
    hint: "1 = very noisy, 5 = very quiet",
  },
];

// Zod's messages are written for developers; these are for guests.
function nameError(error: FieldError | undefined): string | undefined {
  if (!error) return undefined;
  if (error.type === "too_big") {
    return `Use ${String(NAME_MAX)} characters or fewer`;
  }
  return "Enter your name";
}

function textError(error: FieldError | undefined): string | undefined {
  if (!error) return undefined;
  // From the server (422), e.g. moderation.
  if (error.type === "server") return error.message;
  if (error.type === "too_big") {
    return `Use ${String(TEXT_MAX)} characters or fewer`;
  }
  return `Write at least ${String(TEXT_MIN)} characters`;
}

interface ReviewFormProps {
  stayId: string;
  open: boolean;
  onClose: () => void;
  onAdded: (review: Review) => void;
}

export function ReviewForm({
  stayId,
  open,
  onClose,
  onAdded,
}: ReviewFormProps) {
  const formId = useId();
  const addReview = useAddReview(stayId);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReviewCreate>({
    resolver: zodResolver(ReviewCreateSchema),
    defaultValues: { authorName: "", text: "" },
  });

  const onSubmit = handleSubmit((values) => {
    addReview.mutate(values, {
      onSuccess: (review) => {
        reset();
        addReview.reset();
        onAdded(review);
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 422) {
          setError(
            "text",
            { type: "server", message: error.message },
            { shouldFocus: true },
          );
        }
      },
    });
  });

  const close = () => {
    addReview.reset();
    onClose();
  };

  // 422s are shown on the text field; anything else goes above the buttons.
  const failure =
    addReview.error &&
    !(addReview.error instanceof ApiError && addReview.error.status === 422)
      ? addReview.error
      : null;

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Write a review"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={addReview.isPending}>
            Post review
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className="flex flex-col gap-5"
      >
        <Field label="Your name" error={nameError(errors.authorName)}>
          {(props) => (
            <Input
              autoComplete="given-name"
              {...props}
              {...register("authorName")}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          {RATINGS.map((rating) => (
            <StarRatingInput key={rating.name} control={control} {...rating} />
          ))}
        </div>

        <Field
          label="Your review"
          hint={`What was it like to work from here? At least ${String(TEXT_MIN)} characters.`}
          error={textError(errors.text)}
        >
          {(props) => <Textarea {...props} {...register("text")} />}
        </Field>

        {failure && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-sm text-danger"
          >
            <AlertIcon className="size-4 shrink-0" />
            {failure instanceof ApiError && failure.status === 0
              ? failure.message
              : "We couldn't post your review. Please try again."}
          </p>
        )}
      </form>
    </Dialog>
  );
}
