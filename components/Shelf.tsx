"use client";

import type { Quote } from "@/lib/zenquotes";

type ShelfProps = {
  quotes: Quote[];
  onRemove: (quoteText: string) => void;
  onClose: () => void;
};

export default function Shelf({ quotes, onRemove, onClose }: ShelfProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="font-serif text-xl">Your shelf</h2>
          <button
            onClick={onClose}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Close
          </button>
        </div>

        {quotes.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted">
            Nothing saved yet. Tap “Keep” on a quote that lands for you.
          </p>
        ) : (
          <ul className="space-y-4 overflow-y-auto px-6 py-5">
            {quotes.map((q) => (
              <li key={q.q} className="group rounded-xl bg-background/50 p-4">
                <p className="font-serif italic leading-relaxed">{q.q}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-muted">
                  <span>— {q.a}</span>
                  <button
                    onClick={() => onRemove(q.q)}
                    className="opacity-60 transition hover:text-foreground group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
