import { useState } from "react";
import { HeartIcon } from "../../components/icons";
import { cx } from "../../lib/cx";
import { useFavorites } from "../favorites/useFavorites";

// "♡ Save" next to the stay title. The label stays the same; aria-pressed
// and the filled heart show the state.
export function SaveButton({ id, name }: { id: string; name: string }) {
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
        className="inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 font-semibold underline underline-offset-4 hover:bg-surface-alt"
      >
        <HeartIcon
          filled={saved}
          className={cx("size-5", saved && "text-accent")}
        />
        Save
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
