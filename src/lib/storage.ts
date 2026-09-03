import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

/**
 * Storage driver abstraction (PROMPT.md §4). `local` writes into
 * `public/uploads` for development; `s3` targets any S3-compatible bucket
 * (Backblaze B2, Cloudflare R2, …). The SDK is imported lazily so local
 * installs never load it.
 */

export type StoredObject = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
};

export type PutInput = {
  body: Buffer;
  mimeType: string;
  /** Original filename — only its extension is kept. */
  filename?: string;
  folder?: string;
};

const DRIVER = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase();
const LOCAL_ROOT = path.join(process.cwd(), 'public', 'uploads');

/** Randomised object key: callers can never influence the path. */
function buildKey(folder: string, filename?: string): string {
  const ext = filename
    ? path
        .extname(filename)
        .toLowerCase()
        .replace(/[^.a-z0-9]/g, '')
    : '';
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'uploads';
  return `${safeFolder}/${randomUUID()}${ext.slice(0, 10)}`;
}

async function putLocal(key: string, body: Buffer): Promise<string> {
  const target = path.join(LOCAL_ROOT, key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, body);
  // Served through the route handler, not `public/`: `next start` snapshots the
  // public directory at boot, so freshly written files would 404.
  return `/api/uploads/${key}`;
}

async function putS3(key: string, body: Buffer, mimeType: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const bucket = requireEnv('S3_BUCKET');
  const client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
      // User uploads are never served inline from our origin.
      ContentDisposition: 'attachment',
    }),
  );

  const base = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '');
  return base ? `${base}/${key}` : `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when STORAGE_DRIVER=s3`);
  return value;
}

export async function putObject({
  body,
  mimeType,
  filename,
  folder = 'uploads',
}: PutInput): Promise<StoredObject> {
  const key = buildKey(folder, filename);
  const url = DRIVER === 's3' ? await putS3(key, body, mimeType) : await putLocal(key, body);
  return { key, url, size: body.byteLength, mimeType };
}

export async function deleteObject(key: string): Promise<void> {
  if (DRIVER === 's3') {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: {
        accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
      },
    });
    await client.send(new DeleteObjectCommand({ Bucket: requireEnv('S3_BUCKET'), Key: key }));
    return;
  }

  await unlink(path.join(LOCAL_ROOT, key)).catch(() => undefined);
}

export function storageDriver(): string {
  return DRIVER;
}

/** Content hash, used to spot duplicate uploads in the media library. */
export function hashBuffer(body: Buffer): string {
  return createHash('sha256').update(body).digest('hex').slice(0, 32);
}
