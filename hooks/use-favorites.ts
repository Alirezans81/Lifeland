"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  parseFavorites,
  subscribeFavorites,
  writeFavorites,
} from "@/lib/favorites-storage";

export function useFavorites(): {
  favorites: Set<string>;
  toggle: (id: string) => void;
} {
  const snapshot = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );

  const favorites = parseFavorites(snapshot);

  const toggle = useCallback((id: string) => {
    if (!id) {
      return;
    }

    const currentFavorites = parseFavorites(getFavoritesSnapshot());

    if (currentFavorites.has(id)) {
      currentFavorites.delete(id);
    } else {
      currentFavorites.add(id);
    }

    writeFavorites(currentFavorites);
  }, []);

  return { favorites, toggle };
}
