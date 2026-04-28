import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  try {
    const results = await searchAnime(q, page, 24, genre);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
