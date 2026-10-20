const FAVORITES_KEY = "lifelands-favorites";

const listeners = new Set<() => void>();

export function parseFavorites(value: string | null): Set<string> {
  if (value === null) {
    return new Set<string>();
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      ),
    );
  } catch {
    return new Set<string>();
  }
}

export function readFavorites(): Set<string> {
  try {
    return parseFavorites(window.localStorage.getItem(FAVORITES_KEY));
  } catch {
    return new Set<string>();
  }
}

export function writeFavorites(favorites: Set<string>): void {
  try {
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(Array.from(favorites)),
    );
  } catch {
    // Storage may be unavailable.
  }

  listeners.forEach((listener) => listener());
}

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getFavoritesSnapshot(): string {
  try {
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function getServerFavoritesSnapshot(): string {
  return "[]";
}

export { FAVORITES_KEY };
