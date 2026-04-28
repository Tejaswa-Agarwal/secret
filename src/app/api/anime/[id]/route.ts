import { NextRequest, NextResponse } from 'next/server';
import { getAnimeById } from '@/lib/anilist';
import { getEpisodes } from '@/lib/consumet';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const [anime, episodes] = await Promise.all([
      getAnimeById(numId),
      getEpisodes(numId),
    ]);
    return NextResponse.json({ ...anime, episodeList: episodes });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
