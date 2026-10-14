import type { BookingCreate, StayDetail } from "@deskaway/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { ChevronLeftIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { ApiError } from "../../lib/api";
import { useBookingState } from "../stay/PricePanel";
import { useStay } from "../stay/queries";
import { CheckoutStep } from "./CheckoutStep";
import { CheckoutSummary } from "./CheckoutSummary";
import {
  type CheckoutInput,
  CheckoutSchema,
  type CheckoutValues,
  DEMO_CARD,
  EMPTY_CHECKOUT,
} from "./checkoutSchema";
import { DetailsStep, detailsSummary } from "./DetailsStep";
import { PaymentStep } from "./PaymentStep";
import { useCreateBooking } from "./queries";
import { TripStep, tripSummary } from "./TripStep";
import { useCheckoutSteps } from "./useCheckoutSteps";

function Checkout({ stay }: { stay: StayDetail }) {
  const navigate = useNavigate();
  const { state, params } = useBookingState(stay);
  const createBooking = useCreateBooking(stay.id);

  const [showTripProblem, setShowTripProblem] = useState(false);
  const checkInRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    trigger,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput, unknown, CheckoutValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: EMPTY_CHECKOUT,
  });
  const [note, guestName, guestEmail] = useWatch({
    control,
    name: ["note", "guestName", "guestEmail"],
  });

  const { statusOf, headingRefs, goNext, edit } = useCheckoutSteps({
    trigger,
    onStepChange: () => {
      createBooking.reset();
    },
  });

  // The server's message gets focus, so screen readers hear what went wrong.
  useEffect(() => {
    if (createBooking.error) errorRef.current?.focus();
  }, [createBooking.error]);

  // The note is valid by now; the dates still have to be bookable.
  const tripIsBookable = () => {
    if (state.status !== "bookable") {
      setShowTripProblem(true);
      checkInRef.current?.focus();
      return false;
    }
    setShowTripProblem(false);
    return true;
  };

  const fillDemoCard = () => {
    const options = { shouldValidate: true, shouldDirty: true };
    setValue("cardNumber", DEMO_CARD.cardNumber, options);
    setValue("expiry", DEMO_CARD.expiry, options);
    setValue("cvc", DEMO_CARD.cvc, options);
    setValue("cardName", getValues("guestName"), options);
  };

  // Invalid fields: RHF focuses the first one. Card fields are left out on purpose.
  const submitBooking = (values: CheckoutValues) => {
    const { checkIn, checkOut, guests } = params;
    if (!checkIn || !checkOut) {
      edit(1);
      return;
    }
    const booking: BookingCreate = {
      stayId: stay.id,
      checkIn,
      checkOut,
      guests,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      company: values.company,
      vatNumber: values.vatNumber,
      note: values.note,
    };
    createBooking.mutate(booking, {
      onSuccess: (created) => {
        void navigate(`/bookings/${encodeURIComponent(created.id)}`);
      },
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <aside
        aria-label="Your booking"
        className="lg:sticky lg:top-6 lg:order-last lg:col-span-1 lg:self-start"
      >
        <CheckoutSummary stay={stay} state={state} params={params} />
      </aside>

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitBooking)(event);
        }}
        className="flex flex-col lg:col-span-2"
      >
        <CheckoutStep
          number={1}
          title="Your trip"
          status={statusOf(1)}
          headingRef={headingRefs[1]}
          summary={tripSummary(params, note)}
          onEdit={() => {
            edit(1);
          }}
        >
          <TripStep
            stay={stay}
            state={state}
            params={params}
            register={register}
            noteFieldError={errors.note}
            showProblem={showTripProblem}
            checkInRef={checkInRef}
            onContinue={() => {
              void goNext(tripIsBookable);
            }}
          />
        </CheckoutStep>

        <CheckoutStep
          number={2}
          title="Your details"
          status={statusOf(2)}
          headingRef={headingRefs[2]}
          summary={detailsSummary(guestName, guestEmail)}
          onEdit={() => {
            edit(2);
          }}
        >
          <DetailsStep
            register={register}
            errors={errors}
            onContinue={() => {
              void goNext();
            }}
          />
        </CheckoutStep>

        <CheckoutStep
          number={3}
          title="Payment"
          status={statusOf(3)}
          headingRef={headingRefs[3]}
          onEdit={() => {
            edit(3);
          }}
        >
          <PaymentStep
            register={register}
            errors={errors}
            onFillDemoCard={fillDemoCard}
            submitting={createBooking.isPending}
            submitError={createBooking.error}
            errorRef={errorRef}
          />
        </CheckoutStep>
      </form>
    </div>
  );
}

function LoadingCheckout() {
  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-3">
      <span className="sr-only">Loading checkout…</span>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export function CheckoutPage() {
  const { id = "" } = useParams();
  const { search } = useLocation();
  const { data, error, isPending, isError, isFetching, refetch } = useStay(id);

  let content;
  if (isPending) content = <LoadingCheckout />;
  else if (isError && error instanceof ApiError && error.status === 404) {
    content = (
      <EmptyState
        title="We can't find this stay."
        description="It may have been removed, or the link is wrong."
        actions={
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 font-semibold text-surface hover:bg-primary-hover"
          >
            Back to search
          </Link>
        }
      />
    );
  } else if (isError) {
    content = (
      <ErrorState
        title="We couldn't load this stay"
        message={
          error instanceof ApiError && error.status === 0
            ? error.message
            : "Something went wrong on our side. Please try again."
        }
        onRetry={() => {
          void refetch();
        }}
        retrying={isFetching}
        requestId={error instanceof ApiError ? error.requestId : undefined}
      />
    );
  } else content = <Checkout stay={data} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          to={{ pathname: `/stays/${encodeURIComponent(id)}`, search }}
          className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-alt"
        >
          <ChevronLeftIcon className="size-5" />
          <span className="sr-only">Back to the stay</span>
        </Link>
        <h1 className="text-xl font-semibold sm:text-2xl">Confirm and book</h1>
      </div>
      {content}
    </div>
  );
}
