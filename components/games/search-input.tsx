"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

const SEARCH_DEBOUNCE_MS = 500;

type SearchInputProps = {
  initialQuery: string;
  onCommit: (value: string) => void;
};

export function SearchInput({ initialQuery, onCommit }: SearchInputProps) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [lastCommittedQuery, setLastCommittedQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(draftQuery, SEARCH_DEBOUNCE_MS);

  if (initialQuery !== lastCommittedQuery) {
    setLastCommittedQuery(initialQuery);
    setDraftQuery(initialQuery);
  }

  useEffect(() => {
    if (debouncedQuery === draftQuery && draftQuery !== initialQuery) {
      onCommit(draftQuery);
    }
  }, [debouncedQuery, draftQuery, initialQuery, onCommit]);

  return (
    <div className="space-y-2">
      <label
        htmlFor="game-search"
        className="block text-sm font-medium text-primary"
      >
        جست‌وجوی بازی
      </label>

      <input
        id="game-search"
        type="search"
        value={draftQuery}
        onChange={(event) => setDraftQuery(event.target.value)}
        placeholder="نام بازی یا شرکت سازنده..."
        autoComplete="off"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 text-primary outline-none transition focus:border-accent"
      />
    </div>
  );
}
