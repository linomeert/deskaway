import {
  isVideoCallReady,
  nightsBetween,
  type StayDetail,
  todayIn,
  VIDEO_CALL_MIN_UPLOAD_MBPS,
  type WorkspaceType,
} from "@deskaway/shared";
import { type ReactNode, useId } from "react";
import { BuildingIcon, DeskIcon, VideoIcon } from "../../components/icons";
import { WorkScoreBadge } from "../../components/WorkScoreBadge";

const WORKSPACE_TEXT: Record<WorkspaceType, { title: string; note: string }> = {
  desk: { title: "Dedicated desk", note: "A proper place to work" },
  desk_monitor: {
    title: "Desk with an external monitor",
    note: "Plug in your laptop and go",
  },
  office: { title: "Private office", note: "A separate room with a door" },
};

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const kilometres = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

// "400 m", "1.2 km".
function formatDistance(metres: number): string {
  return metres < 1000
    ? `${String(metres)} m`
    : `${kilometres.format(metres / 1000)} km`;
}

function Highlight({
  icon,
  title,
  note,
}: {
  icon: ReactNode;
  title: ReactNode;
  note: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted">{note}</p>
      </div>
    </li>
  );
}

// "Can I work here?" first: the facts behind the work score.
export function WorkSetup({ stay }: { stay: StayDetail }) {
  const measuredDaysAgo = nightsBetween(
    stay.wifiMeasuredAt,
    todayIn("Europe/Brussels"),
  );
  const workspace = WORKSPACE_TEXT[stay.workspaceType];
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="text-lg font-semibold">
          Work setup
        </h2>
        <WorkScoreBadge score={stay.workScore} />
      </div>
      <ul className="flex flex-col gap-4">
        <Highlight
          icon={<img src="/wifi.svg" alt="" className="h-auto w-6" />}
          title={
            <>
              <span aria-hidden="true" className="tabular-nums">
                Fast wifi: {stay.wifiDownloadMbps}&nbsp;&darr; /{" "}
                {stay.wifiUploadMbps}&nbsp;&uarr; Mbps
              </span>
              <span className="sr-only">
                Fast wifi: {stay.wifiDownloadMbps} Mbps download,{" "}
                {stay.wifiUploadMbps} Mbps upload
              </span>
            </>
          }
          note={`Measured ${relative.format(-measuredDaysAgo, "day")}`}
        />
        <Highlight
          icon={<DeskIcon className="size-6" />}
          title={workspace.title}
          note={workspace.note}
        />
        {stay.coworkingDistanceM !== undefined && (
          <Highlight
            icon={<BuildingIcon className="size-6" />}
            title={`Coworking ${formatDistance(stay.coworkingDistanceM)} away`}
            note="For days you want company"
          />
        )}
        {isVideoCallReady(stay.wifiUploadMbps) && (
          <Highlight
            icon={<VideoIcon className="size-6" />}
            title="Video-call ready"
            note={`Upload of ${String(VIDEO_CALL_MIN_UPLOAD_MBPS)} Mbps or more`}
          />
        )}
      </ul>
    </section>
  );
}
