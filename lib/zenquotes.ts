export type Quote = {
  q: string; // quote text
  a: string; // author
  h?: string; // pre-formatted HTML blockquote (unused here)
};

const BASE = "https://zenquotes.io/api";
const REVALIDATE = 3600; // cache upstream for an hour — also keeps us under the 5-req/30s limit

// ZenQuotes appends an attribution object as the LAST array element on batch
// responses (author "zenquotes.io"), and returns error payloads ("Too many
// requests", "key required") with that same author. Strip them so they never
// surface as a real quote.
function isAttribution(quote: Quote): boolean {
  return quote.a?.toLowerCase() === "zenquotes.io";
}

async function fetchQuotes(path: string): Promise<Quote[]> {
  const res = await fetch(`${BASE}/${path}`, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`ZenQuotes /${path} failed: ${res.status}`);
  const data: Quote[] = await res.json();
  return data.filter((item) => item?.q && !isAttribution(item));
}

export async function getToday(): Promise<Quote | null> {
  const quotes = await fetchQuotes("today");
  return quotes[0] ?? null;
}

export async function getBatch(): Promise<Quote[]> {
  return fetchQuotes("quotes");
}
