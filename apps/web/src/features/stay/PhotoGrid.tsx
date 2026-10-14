import type { Photo } from "@deskaway/shared";
import { useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { PhotosIcon } from "../../components/icons";
import { cx } from "../../lib/cx";

interface Layout {
  grid: string;
  big: string;
  small: string[];
}

// Grid classes by number of small photos (0-4), so the big photo always takes
// the left part and the small ones fill the rest without gaps.
function layoutFor(smallCount: number): Layout {
  switch (smallCount) {
    case 0:
      return { grid: "", big: "sm:row-span-2", small: [] };
    case 1:
      return {
        grid: "sm:grid-cols-2",
        big: "sm:row-span-2",
        small: ["sm:row-span-2"],
      };
    case 2:
      return {
        grid: "sm:grid-cols-3",
        big: "sm:col-span-2 sm:row-span-2",
        small: ["", ""],
      };
    case 3:
      return {
        grid: "sm:grid-cols-4",
        big: "sm:col-span-2 sm:row-span-2",
        small: ["sm:col-span-2", "", ""],
      };
    default:
      return {
        grid: "sm:grid-cols-4",
        big: "sm:col-span-2 sm:row-span-2",
        small: ["", "", "", ""],
      };
  }
}

// Airbnb-style: one large photo and up to four small ones; every photo is in
// the "Show all photos" dialog. On mobile only the large photo shows.
export function PhotoGrid({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = photos;
  const small = rest.slice(0, 4);
  const layout = layoutFor(small.length);

  return (
    <div className="relative">
      <div
        className={cx(
          "grid aspect-square gap-2 overflow-hidden rounded-lg sm:aspect-2/1 sm:grid-rows-2",
          layout.grid,
        )}
      >
        {first && (
          <img
            src={first.url}
            alt={first.alt}
            className={cx("size-full object-cover", layout.big)}
          />
        )}
        {small.map((photo, index) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={photo.alt}
            loading="lazy"
            className={cx(
              "hidden size-full object-cover sm:block",
              layout.small[index],
            )}
          />
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
        className="absolute right-4 bottom-4 shadow-float"
      >
        <PhotosIcon className="size-4" />
        Show all photos
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={`All photos of ${name}`}
      >
        <ul className="flex flex-col gap-4">
          {photos.map((photo) => (
            <li key={photo.url}>
              <img
                src={photo.url}
                alt={photo.alt}
                loading="lazy"
                className="w-full rounded-md"
              />
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
