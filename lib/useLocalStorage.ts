"use client";

import { useEffect, useState } from "react";

// SSR-safe localStorage state. First render returns `initial` on both server and
// client (no hydration mismatch); the stored value is read in an effect, and the
// `hydrated` flag lets callers wait until that read has happened before acting.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // unavailable or malformed storage — fall back to `initial`
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return; // don't clobber stored data before the initial read
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota or availability errors are non-fatal
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
