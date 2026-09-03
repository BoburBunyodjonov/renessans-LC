/** Minimal RFC 4180 CSV writer (quotes, embedded separators, BOM for Excel). */
export function toCsv(rows: Record<string, string | number | null | undefined>[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]!);
  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ];

  // BOM so Excel opens UTF-8 correctly.
  return `﻿${lines.join('\r\n')}`;
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
