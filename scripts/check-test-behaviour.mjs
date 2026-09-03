import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const base = 'http://localhost:3111';
const prisma = new PrismaClient();
const browser = await chromium.launch({ channel: 'chrome' });
let pass = true;

// ---------- 1. resume from localStorage ----------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${base}/uz/tests/level-general`, { waitUntil: 'load' });
  await page.waitForSelector('button[aria-pressed]');

  for (let i = 0; i < 5; i++) {
    await page.locator('button[aria-pressed]').first().click();
    await page.getByRole('button', { name: /Keyingi/ }).click();
    await page.waitForTimeout(60);
  }
  const beforeReload = await page.locator('p.tabular-nums').first().innerText();

  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('text=Tugallanmagan test topildi');
  await page.getByRole('button', { name: 'Davom ettirish' }).click();
  await page.waitForSelector('button[aria-pressed]');
  const afterResume = await page.locator('p.tabular-nums').first().innerText();

  const ok = beforeReload === afterResume && afterResume.startsWith('6');
  pass &&= ok;
  console.log(`resume: before="${beforeReload}" after="${afterResume}" -> ${ok ? 'PASS' : 'FAIL'}`);

  // start-over must reset to question 1
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('text=Tugallanmagan test topildi');
  await page.getByRole('button', { name: 'Boshidan boshlash' }).click();
  await page.waitForSelector('button[aria-pressed]');
  const afterReset = await page.locator('p.tabular-nums').first().innerText();
  const resetOk = afterReset.startsWith('1');
  pass &&= resetOk;
  console.log(`start over: "${afterReset}" -> ${resetOk ? 'PASS' : 'FAIL'}`);
  await page.close();
}

// ---------- 2. keyboard control ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/uz/tests/level-kids`, { waitUntil: 'load' });
  await page.waitForSelector('button[aria-pressed]');
  await page.keyboard.press('2');
  const pressed = await page.locator('button[aria-pressed="true"]').count();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const position = await page.locator('p.tabular-nums').first().innerText();
  const ok = pressed === 1 && position.startsWith('2');
  pass &&= ok;
  console.log(`keyboard: selected=${pressed} moved to "${position}" -> ${ok ? 'PASS' : 'FAIL'}`);
  await page.close();
}

// ---------- 3. countdown auto-submit ----------
// Only runs when TIMEOUT_BASE points at a dev server: the production build
// serves this page from the ISR cache, so a shortened time limit written to the
// database would not be picked up.
if (process.env.TIMEOUT_BASE) {
  const original = await prisma.testCategory.findUnique({
    where: { slug: 'level-kids' },
    select: { timeLimitSec: true, requireContact: true },
  });
  await prisma.testCategory.update({
    where: { slug: 'level-kids' },
    data: { timeLimitSec: 12, requireContact: false },
  });

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(`${process.env.TIMEOUT_BASE}/uz/tests/level-kids`, { waitUntil: 'load' });
  await page.waitForSelector('button[aria-pressed]', { timeout: 60_000 });
  await page.locator('button[aria-pressed]').first().click();

  const shown = await page.evaluate(() => document.body.innerText.match(/\d+:\d\d/)?.[0] ?? null);
  const before = await prisma.testAttempt.count();
  await page.getByRole('button', { name: 'Testni qayta topshirish' }).waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1000);
  const after = await prisma.testAttempt.count();

  const ok = after === before + 1;
  pass &&= ok;
  console.log(
    `countdown ${shown}, auto-submit: attempts ${before} -> ${after} -> ${ok ? 'PASS' : 'FAIL'}`,
  );
  await page.close();

  await prisma.testCategory.update({ where: { slug: 'level-kids' }, data: original ?? {} });
}

await browser.close();
await prisma.$disconnect();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
