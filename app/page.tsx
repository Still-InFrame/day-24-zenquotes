import BreathingRitual from "@/components/BreathingRitual";
import { getBatch, getToday, type Quote } from "@/lib/zenquotes";

export const revalidate = 3600;

// Shown only if ZenQuotes is unreachable at build/revalidate time.
const FALLBACK: Quote = {
  q: "Breathe. You are exactly where you need to be.",
  a: "Unknown",
};

export default async function Home() {
  let today: Quote | null = null;
  let batch: Quote[] = [];
  try {
    [today, batch] = await Promise.all([getToday(), getBatch()]);
  } catch {
    // network/upstream failure — fall back below
  }

  return (
    <BreathingRitual
      today={today ?? FALLBACK}
      batch={batch.length ? batch : [FALLBACK]}
    />
  );
}
