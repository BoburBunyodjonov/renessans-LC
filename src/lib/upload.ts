/**
 * Upload validation (PROMPT.md §17): extension *and* MIME *and* magic bytes.
 * A file has to satisfy all three before it is written anywhere.
 */

export type UploadKind = 'document' | 'image' | 'media';

export const MAX_SIZE: Record<UploadKind, number> = {
  document: 10 * 1024 * 1024,
  image: 5 * 1024 * 1024,
  media: 200 * 1024 * 1024,
};

type Signature = {
  mimeTypes: string[];
  extensions: string[];
  /** Byte sequences the file may start with; `offset` defaults to 0. */
  magic: { bytes: number[]; offset?: number }[];
};

const SIGNATURES: Record<string, Signature> = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    magic: [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  },
  doc: {
    mimeTypes: ['application/msword'],
    extensions: ['.doc'],
    magic: [{ bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }], // OLE2
  },
  docx: {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
    magic: [{ bytes: [0x50, 0x4b, 0x03, 0x04] }, { bytes: [0x50, 0x4b, 0x05, 0x06] }], // ZIP
  },
  jpeg: {
    mimeTypes: ['image/jpeg'],
    extensions: ['.jpg', '.jpeg'],
    magic: [{ bytes: [0xff, 0xd8, 0xff] }],
  },
  png: {
    mimeTypes: ['image/png'],
    extensions: ['.png'],
    magic: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  webp: {
    mimeTypes: ['image/webp'],
    extensions: ['.webp'],
    magic: [{ bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }], // "WEBP" after RIFF header
  },
  gif: {
    mimeTypes: ['image/gif'],
    extensions: ['.gif'],
    magic: [{ bytes: [0x47, 0x49, 0x46, 0x38] }],
  },
  mp3: {
    mimeTypes: ['audio/mpeg'],
    extensions: ['.mp3'],
    magic: [{ bytes: [0x49, 0x44, 0x33] }, { bytes: [0xff, 0xfb] }, { bytes: [0xff, 0xf3] }],
  },
  mp4: {
    mimeTypes: ['video/mp4', 'audio/mp4'],
    extensions: ['.mp4', '.m4a'],
    magic: [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }], // "ftyp"
  },
};

export const KIND_TYPES: Record<UploadKind, string[]> = {
  document: ['pdf', 'doc', 'docx'],
  image: ['jpeg', 'png', 'webp', 'gif'],
  media: ['mp3', 'mp4'],
};

export type UploadCheck =
  | { ok: true; type: string; mimeType: string }
  | { ok: false; reason: 'size' | 'extension' | 'mime' | 'content' | 'empty' };

function matchesMagic(buffer: Buffer, signature: Signature): boolean {
  return signature.magic.some(({ bytes, offset = 0 }) =>
    bytes.every((byte, index) => buffer[offset + index] === byte),
  );
}

export function validateUpload(
  buffer: Buffer,
  filename: string,
  declaredMime: string,
  kind: UploadKind,
): UploadCheck {
  if (buffer.byteLength === 0) return { ok: false, reason: 'empty' };
  if (buffer.byteLength > MAX_SIZE[kind]) return { ok: false, reason: 'size' };

  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  const allowed = KIND_TYPES[kind];

  const byExtension = allowed.filter((type) => SIGNATURES[type]!.extensions.includes(extension));
  if (byExtension.length === 0) return { ok: false, reason: 'extension' };

  const byMime = byExtension.filter((type) =>
    SIGNATURES[type]!.mimeTypes.includes(declaredMime.toLowerCase()),
  );
  if (byMime.length === 0) return { ok: false, reason: 'mime' };

  const byContent = byMime.find((type) => matchesMagic(buffer, SIGNATURES[type]!));
  if (!byContent) return { ok: false, reason: 'content' };

  return { ok: true, type: byContent, mimeType: SIGNATURES[byContent]!.mimeTypes[0]! };
}

/** Human-readable size for the UI. */
export function formatBytes(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, exponent);
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}
