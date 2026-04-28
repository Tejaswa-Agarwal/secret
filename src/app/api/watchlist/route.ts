import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get('animeId');

  if (animeId) {
    // Check if specific anime is in watchlist
    const item = await prisma.watchlist.findUnique({
      where: { userId_animeId: { userId: session.user.id, animeId: parseInt(animeId) } },
    });
    return NextResponse.json({ inWatchlist: !!item });
  }

  // Get full watchlist
  const items = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { animeId } = await req.json();
  if (!animeId) return NextResponse.json({ error: 'animeId required' }, { status: 400 });

  const item = await prisma.watchlist.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    create: { userId: session.user.id, animeId },
    update: {},
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { animeId } = await req.json();
  if (!animeId) return NextResponse.json({ error: 'animeId required' }, { status: 400 });

  await prisma.watchlist.deleteMany({
    where: { userId: session.user.id, animeId },
  });
  return NextResponse.json({ ok: true });
}
