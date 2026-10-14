import { useEffect, useRef, useState } from "react";
import type { UseFormTrigger } from "react-hook-form";
import type { StepStatus } from "./CheckoutStep";
import { type CheckoutInput, STEP_FIELDS } from "./checkoutSchema";

export type Step = 1 | 2 | 3;

const FIELDS_BY_STEP = {
  1: STEP_FIELDS.trip,
  2: STEP_FIELDS.details,
  3: STEP_FIELDS.payment,
};

interface Options {
  trigger: UseFormTrigger<CheckoutInput>;
  // Runs on every step change, before the new step opens.
  onStepChange: () => void;
}

// Which checkout step is open, and focus on its heading when that changes.
export function useCheckoutSteps({ trigger, onStepChange }: Options) {
  const [step, setStep] = useState<Step>(1);
  const tripHeading = useRef<HTMLHeadingElement>(null);
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  const paymentHeading = useRef<HTMLHeadingElement>(null);
  // Set by goTo, so the first render (and StrictMode's re-run) doesn't steal focus.
  const focusHeading = useRef(false);

  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    const heading =
      step === 1 ? tripHeading : step === 2 ? detailsHeading : paymentHeading;
    heading.current?.focus();
  });

  const goTo = (next: Step) => {
    focusHeading.current = true;
    onStepChange();
    setStep(next);
  };

  // Validates the open step's fields (RHF focuses the first invalid one), then
  // opens the next step unless canAdvance says no.
  const goNext = async (canAdvance: () => boolean = () => true) => {
    if (step === 3) return;
    if (!(await trigger(FIELDS_BY_STEP[step], { shouldFocus: true }))) return;
    if (!canAdvance()) return;
    goTo(step === 1 ? 2 : 3);
  };

  const statusOf = (target: Step): StepStatus => {
    if (target < step) return "done";
    return target === step ? "open" : "next";
  };

  return {
    statusOf,
    headingRefs: { 1: tripHeading, 2: detailsHeading, 3: paymentHeading },
    goNext,
    edit: goTo,
  };
}
