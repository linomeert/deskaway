import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe, toggleFavorite } from "./favoritesStore";

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot);

  return {
    ids,
    count: ids.length,
    isFavorite: (id: string) => ids.includes(id),
    toggle: toggleFavorite,
  };
}
