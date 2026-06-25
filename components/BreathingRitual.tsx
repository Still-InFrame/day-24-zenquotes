"use client";

import { useEffect, useRef, useState } from "react";
import Shelf from "@/components/Shelf";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { advanceStreak, todayKey, type StreakState } from "@/lib/streak";
import type { Quote } from "@/lib/zenquotes";

type Props = {
  today: Quote;
  batch: Quote[];
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Break a quote into short lines on word boundaries so each can fade in on its
// own beat, roughly matching the pace of one breath.
function splitLines(text: string, maxLen = 36): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && (current + " " + word).length > maxLen) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function BreathingRitual({ today, batch: initialBatch }: Props) {
  const [batch, setBatch] = useState<Quote[]>(() => shuffle(initialBatch));
  const [index, setIndex] = useState(-1); // -1 = today's quote; 0+ walks the batch
  const [shown, setShown] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [favorites, setFavorites, favHydrated] = useLocalStorage<Quote[]>("zen.favorites", []);
  const [streak, setStreak, streakHydrated] = useLocalStorage<StreakState | null>("zen.streak", null);
  const streakCounted = useRef(false);

  const current = index < 0 ? today : batch[index] ?? today;
  const lines = splitLines(current.q);
  const isSaved = favorites.some((f) => f.q === current.q);

  // Re-trigger the line-by-line reveal whenever the shown quote changes.
  useEffect(() => {
    setShown(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Count the visit once, after the stored streak has been read.
  useEffect(() => {
    if (!streakHydrated || streakCounted.current) return;
    streakCounted.current = true;
    setStreak((prev) => advanceStreak(prev, todayKey()));
  }, [streakHydrated, setStreak]);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quotes");
      if (res.ok) {
        const more: Quote[] = await res.json();
        setBatch((prev) => {
          const seen = new Set(prev.map((q) => q.q));
          const fresh = more.filter((q) => q?.q && !seen.has(q.q));
          return [...prev, ...shuffle(fresh)];
        });
      }
    } catch {
      // keep wrapping through the quotes we already have
    } finally {
      setLoading(false);
    }
  }

  function breatheAgain() {
    setIndex((i) => {
      const next = i + 1;
      if (next >= batch.length - 3) void loadMore(); // top up before we run dry
      return next >= batch.length ? 0 : next;
    });
  }

  function toggleSave() {
    setFavorites((prev) =>
      prev.some((f) => f.q === current.q)
        ? prev.filter((f) => f.q !== current.q)
        : [{ q: current.q, a: current.a }, ...prev]
    );
  }

  const streakLabel =
    streak && streak.count > 0
      ? `${streak.count} day${streak.count > 1 ? "s" : ""} of breathing`
      : "";

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 text-sm text-muted">
        <span>{streakLabel}</span>
        <button
          onClick={() => setShelfOpen(true)}
          className="transition hover:text-foreground"
        >
          Shelf{favHydrated && favorites.length ? ` (${favorites.length})` : ""}
        </button>
      </header>

      <div className="relative flex flex-col items-center">
        <div
          className="orb pointer-events-none absolute -z-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <blockquote
          aria-live="polite"
          className="max-w-2xl font-serif text-2xl leading-relaxed sm:text-3xl sm:leading-relaxed"
        >
          {lines.map((line, i) => (
            <span
              key={`${index}-${i}`}
              className={`reveal-line block ${shown ? "shown" : ""}`}
              style={{ transitionDelay: `${i * 0.85}s` }}
            >
              {line}
            </span>
          ))}
        </blockquote>

        <cite
          key={`cite-${index}`}
          className={`reveal-line mt-7 block text-base not-italic text-muted ${shown ? "shown" : ""}`}
          style={{ transitionDelay: `${lines.length * 0.85 + 0.3}s` }}
        >
          — {current.a}
        </cite>
      </div>

      <div className="mt-14 flex items-center gap-3 text-sm">
        <button
          onClick={toggleSave}
          aria-pressed={isSaved}
          className={`rounded-full border px-5 py-2.5 transition ${
            isSaved
              ? "border-accent/60 bg-accent/15 text-foreground"
              : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
          }`}
        >
          {isSaved ? "Kept ♥" : "Keep ♡"}
        </button>
        <button
          onClick={breatheAgain}
          className="rounded-full bg-accent/90 px-6 py-2.5 font-medium text-background transition hover:bg-accent"
        >
          Breathe again
        </button>
      </div>

      <footer className="absolute inset-x-0 bottom-0 px-6 py-5 text-xs text-muted">
        Quotes via{" "}
        <a
          href="https://zenquotes.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 transition hover:text-foreground"
        >
          ZenQuotes API
        </a>
      </footer>

      {shelfOpen && (
        <Shelf
          quotes={favorites}
          onRemove={(text) => setFavorites((prev) => prev.filter((f) => f.q !== text))}
          onClose={() => setShelfOpen(false)}
        />
      )}
    </main>
  );
}
