import { type ReactNode, useState } from "react";
import { Badge } from "../../components/Badge";
import { Button, type ButtonVariant } from "../../components/Button";
import { Card } from "../../components/Card";
import { Dialog } from "../../components/Dialog";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Field, Input } from "../../components/Field";
import { Skeleton } from "../../components/Skeleton";
import { WifiSpeed } from "../../components/WifiSpeed";
import { WorkScoreBadge } from "../../components/WorkScoreBadge";

// Dev-only page (see routes.tsx) showing every token and component state.

const COLORS: [name: string, className: string][] = [
  ["ink", "bg-ink"],
  ["muted", "bg-muted"],
  ["surface", "bg-surface"],
  ["surface-alt", "bg-surface-alt"],
  ["border", "bg-border"],
  ["primary", "bg-primary"],
  ["primary-hover", "bg-primary-hover"],
  ["accent", "bg-accent"],
  ["accent-ink", "bg-accent-ink"],
  ["accent-soft", "bg-accent-soft"],
  ["success", "bg-success"],
  ["danger", "bg-danger"],
];

const TYPE_SCALE: [label: string, className: string][] = [
  ["text-2xl · 32px", "text-2xl"],
  ["text-xl · 24px", "text-xl"],
  ["text-lg · 20px", "text-lg"],
  ["text-base · 16px", "text-base"],
  ["text-sm · 14px", "text-sm"],
];

const SCORES = [95, 80, 79, 60, 59, 0];

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border py-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted">{label}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex size-full items-center justify-center bg-border text-sm text-muted">
      Photo
    </div>
  );
}

function ButtonsSection() {
  const [loading, setLoading] = useState(false);

  return (
    <Section title="Button">
      {VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          <Button variant={variant}>Reserve</Button>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Loading
          </Button>
        </Row>
      ))}
      <Row label="Loading toggle (watch the width stay put)">
        <Button
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 2000);
          }}
        >
          Confirm booking
        </Button>
      </Row>
    </Section>
  );
}

function FieldsSection() {
  return (
    <Section title="Field">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name">
          {(control) => <Input {...control} placeholder="Ada Lovelace" />}
        </Field>
        <Field label="Email" hint="We send your booking confirmation here.">
          {(control) => <Input {...control} type="email" />}
        </Field>
        <Field
          label="Email"
          hint="We send your booking confirmation here."
          error="Enter a valid email address."
        >
          {(control) => <Input {...control} type="email" defaultValue="ada@" />}
        </Field>
        <Field label="City" hint="Disabled">
          {(control) => <Input {...control} disabled defaultValue="Ghent" />}
        </Field>
      </div>
    </Section>
  );
}

function DialogSection() {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };

  return (
    <Section title="Dialog">
      <Row label="Focus moves in, Tab stays inside, Esc closes, focus returns">
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Write a review
        </Button>
      </Row>
      <Dialog
        open={open}
        onClose={close}
        title="Write a review"
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Post review</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Your name">{(control) => <Input {...control} />}</Field>
          <Field label="Review" hint="What was it like to work from here?">
            {(control) => <Input {...control} />}
          </Field>
        </div>
      </Dialog>
    </Section>
  );
}

export function StyleguidePage() {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-2 pb-8">
        <h1 className="text-2xl font-bold">Styleguide</h1>
        <p className="text-muted">
          Dev only. Tab through the page to check the focus ring everywhere.
        </p>
      </header>

      <Section title="Colours">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {COLORS.map(([name, swatch]) => (
            <li key={name} className="flex flex-col gap-2">
              <span
                className={`h-16 rounded-lg border border-border ${swatch}`}
              />
              <span className="text-sm">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        {TYPE_SCALE.map(([label, size]) => (
          <p key={label} className={size}>
            {label} — Work from Ghent with 250 Mbps wifi
          </p>
        ))}
      </Section>

      <Section title="Radius and shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex size-24 items-center justify-center rounded-md bg-surface-alt text-sm">
            md · 8px
          </div>
          <div className="flex size-24 items-center justify-center rounded-lg bg-surface-alt text-sm">
            lg · 12px
          </div>
          <div className="flex h-24 w-32 items-center justify-center rounded-full bg-surface-alt text-sm">
            full
          </div>
          <div className="flex size-24 items-center justify-center rounded-lg bg-surface text-sm shadow-float">
            float
          </div>
        </div>
      </Section>

      <ButtonsSection />
      <FieldsSection />

      <Section title="Badge">
        <Row label="Tones">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Available</Badge>
          <Badge tone="danger">Sold out</Badge>
          <span className="rounded-lg bg-border p-3">
            <Badge tone="floating">Floating</Badge>
          </span>
        </Row>
      </Section>

      <Section title="WorkScoreBadge">
        <Row label="Bands: 80+ excellent, 60-79 good, below 60 fair">
          {SCORES.map((score) => (
            <WorkScoreBadge key={score} score={score} />
          ))}
        </Row>
      </Section>

      <Section title="WifiSpeed">
        <Row label="Down and up">
          <WifiSpeed downMbps={250} upMbps={40} />
        </Row>
        <Row label="Down only">
          <WifiSpeed downMbps={85} />
        </Row>
      </Section>

      <Section title="Card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            media={
              <>
                <PhotoPlaceholder />
                <WorkScoreBadge score={90} className="absolute top-3 left-3" />
              </>
            }
          >
            <div className="flex justify-between font-semibold">
              <h3>Canal loft, Ghent</h3>
              <span>€120</span>
            </div>
            <WifiSpeed downMbps={250} upMbps={40} className="text-sm" />
          </Card>
          <Card>
            <h3 className="font-semibold">Card without media</h3>
            <p className="text-muted">Text only.</p>
          </Card>
        </div>
      </Section>

      <Section title="Skeleton">
        <div
          aria-busy="true"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <span className="sr-only">Loading…</span>
          <div className="flex flex-col gap-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="No stays match all your filters"
          description="Try removing a filter or searching another city."
          actions={
            <>
              <Button variant="secondary">Remove wifi filter</Button>
              <Button variant="ghost">Clear all</Button>
            </>
          }
        />
      </Section>

      <Section title="ErrorState">
        <ErrorState
          message="We couldn't load stays. Check your connection and try again."
          onRetry={() => undefined}
          requestId="req-7f3a9c"
        />
        <ErrorState
          title="Still trying"
          message="Retrying, without a request id."
          onRetry={() => undefined}
          retrying
        />
      </Section>

      <DialogSection />
    </div>
  );
}
