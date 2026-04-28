import { NextResponse } from 'next/server';
import { getTrendingAnime } from '@/lib/anilist';

export async function GET() {
  try {
    const anime = await getTrendingAnime(1, 20);
    return NextResponse.json(anime);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
