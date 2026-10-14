import type { PriceLine } from "@deskaway/shared";
import { formatGuests, formatPrice } from "../../lib/format";

function lineLabel(
  line: PriceLine,
  pricePerNight: number,
  nights: number,
  guests: number,
) {
  switch (line.kind) {
    case "nights":
      return `${formatPrice(pricePerNight)} × ${String(nights)} ${nights === 1 ? "night" : "nights"}`;
    case "cleaningFee":
      return "Cleaning fee";
    case "cityTax":
      return `City tax (${formatGuests(guests)})`;
  }
}

interface PriceBreakdownProps {
  lines: PriceLine[];
  total: number;
  nights: number;
  guests: number;
  pricePerNight: number;
  totalLabel?: string;
}

// Lines and total exactly as the API computed them (quote or booking).
export function PriceBreakdown({
  lines,
  total,
  nights,
  guests,
  pricePerNight,
  totalLabel = "Total",
}: PriceBreakdownProps) {
  return (
    <dl className="flex flex-col gap-2">
      {lines.map((line) => (
        <div key={line.kind} className="flex justify-between gap-4">
          <dt>{lineLabel(line, pricePerNight, nights, guests)}</dt>
          <dd className="tabular-nums">{formatPrice(line.amount)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
        <dt>{totalLabel}</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
