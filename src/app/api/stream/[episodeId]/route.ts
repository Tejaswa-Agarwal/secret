import { NextRequest, NextResponse } from 'next/server';
import { getStreamingSources } from '@/lib/consumet';

export async function GET(req: NextRequest, { params }: { params: Promise<{ episodeId: string }> }) {
  const { episodeId } = await params;
  const decoded = decodeURIComponent(episodeId);
  try {
    const sources = await getStreamingSources(decoded);
    return NextResponse.json(sources);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
