import type { StaySearchQuery, StaySummary } from "@deskaway/shared";
import { useState } from "react";
import { Link } from "react-router";
import { Card } from "../../components/Card";
import { HeartIcon, StarIcon } from "../../components/icons";
import { WorkScoreBadge } from "../../components/WorkScoreBadge";
import { cx } from "../../lib/cx";
import { COUNTRY_NAMES, formatPrice, WORKSPACE_LABELS } from "../../lib/format";
import { useFavorites } from "../favorites/useFavorites";

interface StayCardProps {
  stay: StaySummary;
  // Dates and guests are carried over to the stay page.
  query: Pick<StaySearchQuery, "checkIn" | "checkOut" | "guests">;
}

function stayHref(id: string, query: StayCardProps["query"]): string {
  const params = new URLSearchParams();
  if (query.checkIn && query.checkOut) {
    params.set("checkIn", query.checkIn);
    params.set("checkOut", query.checkOut);
  }
  if (query.guests > 1) params.set("guests", String(query.guests));
  const search = params.toString();
  return `/stays/${encodeURIComponent(id)}${search ? `?${search}` : ""}`;
}

function FavoriteButton({ id, name }: { id: string; name: string }) {
  const { isFavorite, toggle } = useFavorites();
  const [announcement, setAnnouncement] = useState("");
  const saved = isFavorite(id);

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={`Save ${name}`}
        onClick={() => {
          toggle(id);
          setAnnouncement(
            saved ? "Removed from favorites" : "Saved to favorites",
          );
        }}
        className="absolute top-2 right-2 z-10 flex size-10 items-center justify-center rounded-full bg-surface/90 text-ink shadow-float hover:bg-surface"
      >
        <HeartIcon
          filled={saved}
          className={cx("size-5", saved && "text-accent")}
        />
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}

// Airbnb-style card: photo first, no border. The title link is stretched over
// the whole card; the heart sits above it as its own button.
export function StayCard({ stay, query }: StayCardProps) {
  const [photo] = stay.photos;

  return (
    <Card
      className="relative"
      media={
        <>
          {photo && (
            <img
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className="size-full object-cover"
            />
          )}
          <WorkScoreBadge
            score={stay.workScore}
            className="absolute top-3 left-3 shadow-float"
          />
          <FavoriteButton id={stay.id} name={stay.name} />
        </>
      }
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 font-semibold">
          <span className="truncate">
            {stay.city}, {COUNTRY_NAMES[stay.country]}
          </span>
          {stay.averageRating === null ? (
            <span className="shrink-0">New</span>
          ) : (
            <span className="flex shrink-0 items-center gap-1">
              <StarIcon filled className="size-4" />
              <span aria-hidden="true">{stay.averageRating.toFixed(1)}</span>
              <span className="sr-only">
                Rated {stay.averageRating.toFixed(1)} out of 5 from{" "}
                {stay.reviewCount} reviews
              </span>
            </span>
          )}
        </div>
        <h2 className="text-muted">
          <Link
            to={stayHref(stay.id, query)}
            className="rounded-md after:absolute after:inset-0"
          >
            {stay.name}
          </Link>
        </h2>
        <p className="flex items-center gap-1.5 text-muted">
          <img src="/wifi.svg" alt="" className="h-auto w-2.75 shrink-0" />
          <span>
            <span className="sr-only">Wifi </span>
            {stay.wifiDownloadMbps} Mbps ·{" "}
            {WORKSPACE_LABELS[stay.workspaceType]}
          </span>
        </p>
        <p className="mt-1">
          <span className="font-semibold">
            {formatPrice(stay.pricePerNight)}
          </span>{" "}
          night
        </p>
      </div>
    </Card>
  );
}
