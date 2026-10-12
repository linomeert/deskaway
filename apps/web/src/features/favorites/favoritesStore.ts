// Saved stay ids, kept in localStorage (no accounts, see NOTES.md).
// Storage can be missing or throw (private mode, blocked, full); the store then
// keeps working from memory for this session.

const STORAGE_KEY = "deskaway:favorites";

type Listener = () => void;

const listeners = new Set<Listener>();
let ids: readonly string[] | null = null;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function readStorage(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(next: readonly string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Memory fallback: the change still applies until the page reloads.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

// Another tab changed favorites (or cleared storage): reload and re-render.
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  ids = readStorage();
  emit();
}

export function subscribe(listener: Listener): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

// Stable reference between writes, as useSyncExternalStore requires.
export function getSnapshot(): readonly string[] {
  ids ??= readStorage();
  return ids;
}

export function toggleFavorite(id: string): void {
  const current = getSnapshot();
  ids = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  writeStorage(ids);
  emit();
}
