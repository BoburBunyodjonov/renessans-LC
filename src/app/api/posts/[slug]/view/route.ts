import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Increments a post's view counter. Always answers 204 — analytics never blocks. */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await prisma.post
    .updateMany({ where: { slug, isPublished: true }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);

  return new NextResponse(null, { status: 204 });
}
