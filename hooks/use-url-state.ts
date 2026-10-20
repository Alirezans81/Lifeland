"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deserializeUrlValue, serializeUrlValue } from "@/lib/url-state";

type UrlStateOptions = {
  history?: "push" | "replace";
};

export function useUrlState<T>(
  key: string,
  defaultValue: T,
  options: UrlStateOptions = {},
): [T, (value: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryValue = searchParams.get(key);
  const history = options.history ?? "push";

  const pendingUrlRef = useRef<string | null>(null);

  const value = useMemo(
    () => deserializeUrlValue(queryValue, defaultValue),
    [queryValue, defaultValue],
  );

  useEffect(() => {
    const pendingUrl = pendingUrlRef.current;

    if (pendingUrl === null) return;

    const expectedUrl = new URL(pendingUrl, window.location.origin);
    const currentSearch = queryString ? `?${queryString}` : "";

    if (
      expectedUrl.pathname === pathname &&
      expectedUrl.search === currentSearch
    ) {
      pendingUrlRef.current = null;
    }
  }, [pathname, queryString]);

  useEffect(() => {
    const handlePopState = () => {
      pendingUrlRef.current = null;
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setValue = useCallback(
    (nextValue: T) => {
      const currentUrl = new URL(
        pendingUrlRef.current ?? window.location.href,
        window.location.origin,
      );

      if (JSON.stringify(nextValue) === JSON.stringify(defaultValue)) {
        currentUrl.searchParams.delete(key);
      } else {
        currentUrl.searchParams.set(key, serializeUrlValue(nextValue));
      }

      const url = currentUrl.pathname + currentUrl.search + currentUrl.hash;

      pendingUrlRef.current = url;

      if (history === "replace") {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [defaultValue, history, key, router],
  );

  return [value, setValue];
}
