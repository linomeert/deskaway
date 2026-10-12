import { type StaySearchQuery, WorkspaceTypeSchema } from "@deskaway/shared";
import { useId, useState } from "react";
import { ChipButton, ChipRadio } from "../../components/Chip";
import { ChipMenu } from "../../components/ChipMenu";
import { SlidersIcon, SortIcon } from "../../components/icons";
import { WORKSPACE_LABELS } from "../../lib/format";
import { FAST_WIFI_MBPS, SORT_CHOICES, SORT_LABELS } from "./filters";
import { FiltersDialog } from "./FiltersDialog";
import type { StaySearchPatch } from "./useStaySearchParams";

interface FilterBarProps {
  query: StaySearchQuery;
  onChange: (patch: StaySearchPatch) => void;
}

export function FilterBar({ query, onChange }: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const workspaceName = useId();
  const sortChoices = SORT_CHOICES.includes(query.sort)
    ? SORT_CHOICES
    : [...SORT_CHOICES, query.sort];
  const fastWifi = query.minWifi === FAST_WIFI_MBPS;

  return (
    <>
      {/* Mobile: one row that scrolls sideways. */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <ChipButton
          icon={<SlidersIcon className="size-4" />}
          aria-label="Filters"
          aria-haspopup="dialog"
          className="sm:order-last"
          onClick={() => {
            setFiltersOpen(true);
          }}
        >
          <span aria-hidden="true" className="hidden sm:inline">
            Filters
          </span>
        </ChipButton>

        <ChipButton
          pressed={fastWifi}
          onClick={() => {
            onChange({ minWifi: fastWifi ? undefined : FAST_WIFI_MBPS });
          }}
        >
          Wifi {FAST_WIFI_MBPS}+
        </ChipButton>

        <fieldset className="flex shrink-0 gap-2">
          <legend className="sr-only">Workspace</legend>
          <ChipRadio
            name={workspaceName}
            label="Any workspace"
            checked={query.workspace === undefined}
            onChange={() => {
              onChange({ workspace: undefined });
            }}
          />
          {WorkspaceTypeSchema.options.map((workspace) => (
            <ChipRadio
              key={workspace}
              name={workspaceName}
              label={WORKSPACE_LABELS[workspace]}
              checked={query.workspace === workspace}
              onChange={() => {
                onChange({ workspace });
              }}
            />
          ))}
        </fieldset>

        <span className="hidden sm:block sm:flex-1" />

        <ChipMenu
          label="Sort"
          icon={<SortIcon className="size-4" />}
          value={query.sort}
          options={sortChoices.map((sort) => ({
            value: sort,
            label: SORT_LABELS[sort],
          }))}
          onChange={(sort) => {
            onChange({ sort });
          }}
        />
      </div>

      {filtersOpen && (
        <FiltersDialog
          query={query}
          onApply={onChange}
          onClose={() => {
            setFiltersOpen(false);
          }}
        />
      )}
    </>
  );
}
