import { NextResponse } from 'next/server';

// Streaming is now handled entirely by embed iframes in the VideoPlayer.
// This route returns empty sources, causing VideoPlayer to skip HLS mode.
export async function GET() {
  return NextResponse.json({ sources: [] });
}
