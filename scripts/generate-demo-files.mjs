import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Writes the placeholder files the seeded materials point at, so the download
 * flow delivers a real file instead of a 404. These are stand-ins: replace
 * `public/demo` with the school's own materials before launch.
 *
 *   node scripts/generate-demo-files.mjs
 */

const OUT = path.join(process.cwd(), 'public', 'demo');

/** A real, single-page PDF — offsets are computed so the xref table is valid. */
function buildPdf(title, subtitle) {
  const escape = (text) => text.replace(/([()\\])/g, '\\$1');
  const content = [
    'BT',
    '/F1 28 Tf',
    `72 742 Td (${escape(title)}) Tj`,
    '/F1 13 Tf',
    `0 -30 Td (${escape(subtitle)}) Tj`,
    '0 -26 Td (Renessans English School - namuna fayl) Tj',
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R ' +
      '/Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

/** A real WAV: 16-bit mono silence, so the file plays instead of erroring. */
function buildWav(seconds = 3, sampleRate = 8000) {
  const samples = seconds * sampleRate;
  const data = Buffer.alloc(samples * 2); // silence
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}

const PDFS = [
  ['beginner-student-book', 'Beginner Student Book', 'Noldan boshlovchilar uchun darslik'],
  ['beginner-work-book', 'Beginner Work Book', 'Mashqlar daftari'],
  ['elementary-student-book', 'Elementary Student Book', 'Elementary darajasi uchun darslik'],
  ['elementary-work-book', 'Elementary Work Book', 'Mashqlar daftari'],
  ['pre-intermediate-student-book', 'Pre-Intermediate Student Book', 'Pre-Intermediate darsligi'],
  ['intermediate-student-book', 'Intermediate Student Book', 'Intermediate darsligi'],
  ['upper-intermediate-work-book', 'Upper-Intermediate Work Book', 'Mashqlar daftari'],
  ['ielts-writing-templates', 'IELTS Writing Task 2', 'Esse shablonlari va boglovchi iboralar'],
  ['ielts-speaking-cue-cards', 'IELTS Speaking Part 2', 'Kartochkalar toplami'],
  ['kids-abc-workbook', 'Kids ABC Workbook', 'Alifbo mashqlari'],
];

const AUDIO = [
  ['beginner-listening-01', 6],
  ['elementary-dialogues', 8],
  ['ielts-listening-test-1', 12],
  ['pronunciation-44-sounds', 10],
  ['kids-songs', 8],
];

await mkdir(OUT, { recursive: true });

for (const [name, title, subtitle] of PDFS) {
  await writeFile(path.join(OUT, `${name}.pdf`), buildPdf(title, subtitle));
}
for (const [name, seconds] of AUDIO) {
  await writeFile(path.join(OUT, `${name}.wav`), buildWav(seconds));
}

console.log(`wrote ${PDFS.length} PDFs and ${AUDIO.length} audio files to public/demo`);
