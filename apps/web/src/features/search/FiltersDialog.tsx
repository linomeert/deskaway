import {
  type StaySearchQuery,
  type StaySort,
  type WorkspaceType,
  WorkspaceTypeSchema,
} from "@deskaway/shared";
import { type SubmitEvent, useId, useState } from "react";
import { Button } from "../../components/Button";
import { ChipRadio } from "../../components/Chip";
import { Dialog } from "../../components/Dialog";
import { WORKSPACE_LABELS } from "../../lib/format";
import { SORT_CHOICES, SORT_LABELS, WIFI_SLIDER } from "./filters";
import type { StaySearchPatch } from "./useStaySearchParams";

interface FiltersDialogProps {
  query: StaySearchQuery;
  onApply: (patch: StaySearchPatch) => void;
  onClose: () => void;
}

function wifiLabel(mbps: number): string {
  return mbps === 0 ? "Any speed" : `${String(mbps)}+ Mbps`;
}

// Changes are a draft until "Show stays", like Airbnb's filter sheet.
export function FiltersDialog({ query, onApply, onClose }: FiltersDialogProps) {
  const formId = useId();
  const wifiId = useId();
  const workspaceName = useId();
  const sortName = useId();
  const [minWifi, setMinWifi] = useState(query.minWifi ?? 0);
  const [workspace, setWorkspace] = useState<WorkspaceType | undefined>(
    query.workspace,
  );
  const [sort, setSort] = useState<StaySort>(query.sort);
  const sortChoices = SORT_CHOICES.includes(query.sort)
    ? SORT_CHOICES
    : [...SORT_CHOICES, query.sort];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({ minWifi: minWifi > 0 ? minWifi : undefined, workspace, sort });
    onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Filters"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setMinWifi(0);
              setWorkspace(undefined);
              setSort("workScore");
            }}
          >
            Clear all
          </Button>
          <Button type="submit" form={formId}>
            Show stays
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={wifiId} className="font-semibold">
              Minimum wifi download
            </label>
            <output htmlFor={wifiId} className="text-sm text-muted">
              {wifiLabel(minWifi)}
            </output>
          </div>
          <input
            id={wifiId}
            type="range"
            min={WIFI_SLIDER.min}
            max={WIFI_SLIDER.max}
            step={WIFI_SLIDER.step}
            value={minWifi}
            aria-valuetext={wifiLabel(minWifi)}
            onChange={(event) => {
              setMinWifi(event.target.valueAsNumber);
            }}
            className="h-11 w-full accent-primary"
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-semibold">Workspace</legend>
          <div className="flex flex-wrap gap-2">
            <ChipRadio
              name={workspaceName}
              label="Any"
              checked={workspace === undefined}
              onChange={() => {
                setWorkspace(undefined);
              }}
            />
            {WorkspaceTypeSchema.options.map((option) => (
              <ChipRadio
                key={option}
                name={workspaceName}
                label={WORKSPACE_LABELS[option]}
                checked={workspace === option}
                onChange={() => {
                  setWorkspace(option);
                }}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-semibold">Sort by</legend>
          <div className="flex flex-wrap gap-2">
            {sortChoices.map((option) => (
              <ChipRadio
                key={option}
                name={sortName}
                label={SORT_LABELS[option]}
                checked={sort === option}
                onChange={() => {
                  setSort(option);
                }}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
