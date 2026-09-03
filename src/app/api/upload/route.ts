import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, isSameOrigin, logError, ok, requestId, serverError } from '@/lib/api';
import { putObject } from '@/lib/storage';
import { KIND_TYPES, validateUpload, type UploadKind } from '@/lib/upload';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = Object.keys(KIND_TYPES) as UploadKind[];

/** Admin-only upload: writes to storage and registers a `MediaAsset`. */
export async function POST(request: NextRequest) {
  const id = requestId();

  if (!isSameOrigin(request)) return fail('FORBIDDEN_ORIGIN', 'Origin not allowed', 403);

  const user = await currentUser();
  if (!user) return fail('UNAUTHENTICATED', 'Sign in required', 401);
  if (!can(user.role, 'contentCrud')) return fail('FORBIDDEN', 'Not allowed', 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('BAD_REQUEST', 'Body must be multipart/form-data', 400);
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return fail('NO_FILE', 'File is required', 422);
  }

  const requestedKind = form.get('kind')?.toString() as UploadKind | undefined;
  const kind: UploadKind = requestedKind && KINDS.includes(requestedKind) ? requestedKind : 'image';
  const folder = (form.get('folder')?.toString() || kind + 's').slice(0, 40);

  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateUpload(buffer, file.name, file.type, kind);
  if (!check.ok) return fail('INVALID_FILE', 'File rejected', 422, { file: check.reason });

  try {
    const stored = await putObject({
      body: buffer,
      mimeType: check.mimeType,
      filename: file.name,
      folder,
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        url: stored.url,
        key: stored.key,
        mimeType: stored.mimeType,
        size: stored.size,
        folder,
      },
      select: { id: true, url: true, key: true, mimeType: true, size: true, folder: true },
    });

    return ok(asset, { status: 201 });
  } catch (error) {
    logError('api/upload', id, error);
    return serverError(id);
  }
}
