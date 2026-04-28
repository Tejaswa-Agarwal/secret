import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { animeId, episodeId, episodeNum } = await req.json();
  if (!animeId || !episodeId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const progress = await prisma.progress.upsert({
    where: { userId_animeId_episodeId: { userId: session.user.id, animeId, episodeId } },
    create: { userId: session.user.id, animeId, episodeId, episodeNum: episodeNum ?? 1 },
    update: { watchedAt: new Date(), episodeNum: episodeNum ?? 1 },
  });
  return NextResponse.json(progress);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const history = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(history);
}
