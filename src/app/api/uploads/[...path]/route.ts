import { NextResponse } from 'next/server';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { Readable } from 'node:stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Serves files written by the `local` storage driver.
 *
 * `next start` snapshots `public/` at boot, so a file uploaded after the server
 * started would 404 — uploads therefore go through this handler instead. It also
 * lets us control the disposition: images render inline, everything else (CVs,
 * documents, anything script-like) downloads as an attachment (PROMPT.md §17).
 */
const ROOT = path.join(process.cwd(), 'public', 'uploads');

const INLINE_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

const ATTACHMENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  const target = path.join(ROOT, ...segments);
  const relative = path.relative(ROOT, target);
  // Reject traversal and absolute escapes before touching the filesystem.
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const extension = path.extname(target).toLowerCase();
  const inlineType = INLINE_TYPES[extension];
  const attachmentType = ATTACHMENT_TYPES[extension];
  if (!inlineType && !attachmentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  let size: number;
  try {
    const stats = await stat(target);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  const stream = Readable.toWeb(createReadStream(target)) as NodeReadableStream<Uint8Array>;

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': inlineType ?? attachmentType!,
      'Content-Length': String(size),
      'Content-Disposition': inlineType
        ? 'inline'
        : `attachment; filename="${path.basename(target)}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
