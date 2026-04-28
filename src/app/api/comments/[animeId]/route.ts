import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ animeId: string }> }) {
  const { animeId } = await params;
  const id = parseInt(animeId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { animeId: id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ animeId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { animeId } = await params;
  const id = parseInt(animeId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { body, episodeId } = await req.json();
  if (!body || typeof body !== 'string' || body.trim().length < 1) {
    return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }
  if (body.trim().length > 1000) {
    return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      animeId: id,
      episodeId: episodeId || null,
      body: body.trim(),
      userId: session.user.id,
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get('id');
  if (!commentId) return NextResponse.json({ error: 'No comment ID' }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
