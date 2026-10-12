import { cx } from "../lib/cx";
import { WifiIcon } from "./icons";

interface WifiSpeedProps {
  downMbps: number;
  upMbps?: number;
  className?: string;
}

export function WifiSpeed({ downMbps, upMbps, className }: WifiSpeedProps) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-ink", className)}>
      <WifiIcon className="size-5 shrink-0 text-accent" />
      <span aria-hidden="true" className="font-semibold tabular-nums">
        {downMbps}&nbsp;&darr;
        {upMbps !== undefined && <> / {upMbps}&nbsp;&uarr;</>} Mbps
      </span>
      <span className="sr-only">
        Wifi {downMbps} Mbps download
        {upMbps !== undefined && `, ${String(upMbps)} Mbps upload`}
      </span>
    </span>
  );
}
