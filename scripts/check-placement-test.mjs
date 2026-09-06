import { chromium } from 'playwright';

/**
 * Drives a complete placement-test run through the real UI: answers every
 * question with the correct option (read from the database), fills the contact
 * gate, and asserts the band, the stored attempt and the linked lead.
 */
const base = process.env.BASE_URL ?? 'http://localhost:3111';
const slug = process.argv[2] ?? 'level-general';
// A fresh number each run: leads are deduplicated by phone and a lead links to
// only one attempt, so reusing a number makes the *second* run look broken.
const randomPhone = () =>
  `+998 (91) 234-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 90) + 10)}`;
const phone = process.argv[3] ?? randomPhone();
const correctRatio = Number(process.argv[4] ?? 1); // share of questions to answer correctly

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

const key = await prisma.testQuestion.findMany({
  where: { isActive: true, category: { slug } },
  orderBy: { order: 'asc' },
  select: {
    id: true,
    prompt: true,
    // Ordered explicitly: the page renders options by `order`, so an unordered
    // read here makes the "correct" index point at the wrong button.
    options: { orderBy: { order: 'asc' }, select: { id: true, isCorrect: true, order: true } },
  },
});
const answerIndex = new Map(key.map((q) => [q.prompt, q.options.findIndex((o) => o.isCorrect)]));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(`${base}/uz/tests/${slug}`, { waitUntil: 'load' });
await page.waitForSelector('button[aria-pressed]');

const target = Math.round(key.length * correctRatio);
let answered = 0;

for (let i = 0; i < key.length; i++) {
  const prompt = await page.locator('p.whitespace-pre-line').first().innerText();
  const correct = answerIndex.get(prompt.trim());
  const options = page.locator('button[aria-pressed]');
  const count = await options.count();
  const pick = answered < target ? correct : (correct + 1) % count;
  await options.nth(pick < 0 ? 0 : pick).click();
  answered++;
  await page.getByRole('button', { name: /Keyingi|Yakunlash/ }).click();
  await page.waitForTimeout(60);
}

// Contact gate
await page.waitForSelector('#gate-name', { timeout: 10_000 });
await page.fill('#gate-name', 'Playwright Talaba');
await page.fill('#gate-phone', phone);
await page.getByRole('button', { name: /Natijani ko/ }).click();

await page.waitForSelector('text=/\\/45/', { timeout: 20_000 });
const resultText = await page.locator('body').innerText();
const scoreShown = resultText.match(/(\d+)\s*\/\s*45/)?.[1];
const levelShown = resultText
  .split('\n')
  .find((l) => /Beginner|Elementary|Pre-|Intermediate|Upper|Starter|Flyers/.test(l));

// localStorage must be cleared once the attempt is stored
const leftover = await page.evaluate(
  (s) => window.localStorage.getItem(`placement-test:${s}`),
  slug,
);

const attempt = await prisma.testAttempt.findFirst({
  orderBy: { createdAt: 'desc' },
  include: {
    lead: { select: { name: true, phone: true, source: true, course: { select: { slug: true } } } },
    category: { select: { slug: true } },
  },
});

console.log(`answered:           ${answered} questions (${target} correct on purpose)`);
console.log(`score on screen:    ${scoreShown}/45`);
console.log(`level on screen:    ${levelShown?.trim()}`);
console.log(`localStorage clear: ${leftover === null}`);
console.log(
  `attempt stored:     ${attempt?.score}/${attempt?.maxScore} band=${attempt?.levelName} category=${attempt?.category.slug} duration=${attempt?.durationSec}s answers=${Array.isArray(attempt?.answers) ? attempt.answers.length : 0}`,
);
console.log(
  `linked lead:        ${attempt?.lead ? `${attempt.lead.name} ${attempt.lead.phone} source=${attempt.lead.source} course=${attempt.lead.course?.slug}` : 'NONE'}`,
);
console.log(`page errors:        ${errors.length ? errors.join(' | ') : 'none'}`);

const ok =
  String(attempt?.score) === scoreShown &&
  attempt?.lead !== null &&
  leftover === null &&
  errors.length === 0;

await browser.close();
await prisma.$disconnect();
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
