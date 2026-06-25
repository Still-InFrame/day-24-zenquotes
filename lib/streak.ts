export type StreakState = {
  lastVisit: string; // YYYY-MM-DD (local calendar day)
  count: number;
};

// Local date key — uses the visitor's own calendar day, not UTC.
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

// Same day -> unchanged; consecutive day -> +1; gap or clock moved back -> reset to 1.
export function advanceStreak(prev: StreakState | null, today: string): StreakState {
  if (!prev) return { lastVisit: today, count: 1 };
  if (prev.lastVisit === today) return prev;
  return daysBetween(prev.lastVisit, today) === 1
    ? { lastVisit: today, count: prev.count + 1 }
    : { lastVisit: today, count: 1 };
}
