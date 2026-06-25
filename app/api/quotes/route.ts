import { NextResponse } from "next/server";
import { getBatch } from "@/lib/zenquotes";

// Server-side proxy so the browser never calls ZenQuotes directly (free tier has
// CORS off). The client hits this only to top up its deck after walking the
// initial batch. Cached for an hour.
export const revalidate = 3600;

export async function GET() {
  try {
    return NextResponse.json(await getBatch());
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
