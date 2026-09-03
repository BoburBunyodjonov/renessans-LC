import { describe, expect, it } from 'vitest';
import { formatBytes, MAX_SIZE, validateUpload } from '@/lib/upload';

const pdf = Buffer.from('%PDF-1.4\ncontent');
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const docx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);

describe('validateUpload', () => {
  it('accepts a real PDF as a document', () => {
    const result = validateUpload(pdf, 'cv.pdf', 'application/pdf', 'document');
    expect(result).toEqual({ ok: true, type: 'pdf', mimeType: 'application/pdf' });
  });

  it('rejects an executable renamed to .pdf', () => {
    const fake = Buffer.from('MZ\x90\x00 windows executable');
    expect(validateUpload(fake, 'cv.pdf', 'application/pdf', 'document')).toEqual({
      ok: false,
      reason: 'content',
    });
  });

  it('rejects a disallowed extension', () => {
    expect(validateUpload(pdf, 'cv.exe', 'application/pdf', 'document')).toEqual({
      ok: false,
      reason: 'extension',
    });
  });

  it('rejects a mismatched MIME type', () => {
    expect(validateUpload(pdf, 'cv.pdf', 'image/png', 'document')).toEqual({
      ok: false,
      reason: 'mime',
    });
  });

  it('rejects a file in the wrong kind bucket', () => {
    // A PNG is valid, but not as a "document".
    expect(validateUpload(png, 'photo.png', 'image/png', 'document').ok).toBe(false);
    expect(validateUpload(png, 'photo.png', 'image/png', 'image').ok).toBe(true);
  });

  it('rejects empty and oversized files', () => {
    expect(validateUpload(Buffer.alloc(0), 'cv.pdf', 'application/pdf', 'document')).toEqual({
      ok: false,
      reason: 'empty',
    });

    const huge = Buffer.concat([pdf, Buffer.alloc(MAX_SIZE.document)]);
    expect(validateUpload(huge, 'cv.pdf', 'application/pdf', 'document')).toEqual({
      ok: false,
      reason: 'size',
    });
  });

  it('accepts docx by its zip signature', () => {
    const result = validateUpload(
      docx,
      'cv.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'document',
    );
    expect(result.ok).toBe(true);
  });
});

describe('formatBytes', () => {
  it('formats sizes readably', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
    expect(formatBytes(0)).toBeNull();
    expect(formatBytes(null)).toBeNull();
  });
});
