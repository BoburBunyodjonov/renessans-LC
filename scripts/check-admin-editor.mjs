import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

/**
 * Phase 6 acceptance check: an EDITOR changes the hero headline, a course price
 * and a teacher photo, and each change shows up on the public site without a
 * redeploy (cache tags are invalidated on save).
 */
const base = process.env.BASE_URL ?? 'http://localhost:3111';
const prisma = new PrismaClient();
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

let pass = true;
const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

const stamp = Date.now().toString().slice(-5);

// ---- sign in as the EDITOR ----
await page.goto(`${base}/admin/login`, { waitUntil: 'load' });
await page.fill('#email', 'editor@school.uz');
await page.fill('#password', 'EditorPass123!');
await page.getByRole('button', { name: 'Kirish' }).click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
say('editor signs in', !page.url().includes('login'));

// EDITOR must not see admin-only sections
const navText = await page.locator('aside').innerText();
say(
  'editor cannot see Users / Audit in the sidebar',
  !navText.includes('Foydalanuvchilar') && !navText.includes('Audit'),
);

// server-side guard, not just hidden UI
const usersResponse = await page.goto(`${base}/admin/users`, { waitUntil: 'load' });
say(
  'editor is redirected away from /admin/users',
  page.url().endsWith('/admin'),
  `${usersResponse?.status()} ${page.url()}`,
);

// ---- 1. hero headline ----
await page.goto(`${base}/admin/hero`, { waitUntil: 'load' });
await page.getByRole('link', { name: 'Tahrirlash' }).first().click();
await page.waitForSelector('#field-headline');
const headline = `Kafolatlangan <mark>IELTS 7+</mark> — ${stamp}`;
await page.fill('#field-headline', headline);
await page.getByRole('button', { name: 'Saqlash' }).click();
await page.waitForTimeout(2500);

// ---- 2. course price ----
await page.goto(`${base}/admin/courses`, { waitUntil: 'load' });
await page.getByRole('link', { name: 'Tahrirlash' }).first().click();
await page.waitForSelector('#field-price');
const newPrice = `9${stamp}0`;
await page.fill('#field-price', newPrice);
await page.getByRole('button', { name: 'Saqlash' }).click();
await page.waitForTimeout(2500);

const courseSlug = await page.evaluate(() => document.querySelector('#field-slug')?.value ?? null);

// ---- 3. teacher photo ----
await page.goto(`${base}/admin/teachers`, { waitUntil: 'load' });
await page.getByRole('link', { name: 'Tahrirlash' }).first().click();
await page.waitForSelector('input[placeholder="https://..."]');
const photo = `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1067&fit=crop&q=80&v=${stamp}`;
await page.locator('input[placeholder="https://..."]').first().fill(photo);
await page.getByRole('button', { name: 'Saqlash' }).click();
await page.waitForTimeout(2500);

// ---- database state ----
const [hero, course, teacher] = await Promise.all([
  prisma.heroSlide.findFirst({ orderBy: { order: 'asc' } }),
  prisma.course.findFirst({ where: { deletedAt: null }, orderBy: { order: 'asc' } }),
  prisma.teacher.findFirst({ orderBy: { order: 'asc' } }),
]);
say(
  'hero headline stored',
  hero?.headline?.uz === headline,
  String(hero?.headline?.uz).slice(0, 60),
);
say('course price stored', String(course?.price) === `${newPrice}`, `price = ${course?.price}`);
say('teacher photo stored', teacher?.photoUrl === photo);

// ---- public site reflects all three, with no redeploy ----
const publicPage = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await publicPage.goto(`${base}/uz`, { waitUntil: 'load' });
await publicPage.waitForTimeout(500);
const homeHtml = await publicPage.content();

say('public homepage shows the new hero headline', homeHtml.includes(`— ${stamp}`));
say(
  'public homepage shows the new price',
  homeHtml.includes(newPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')) || homeHtml.includes(newPrice),
  newPrice,
);

await publicPage.goto(`${base}/uz/teachers`, { waitUntil: 'load' });
const teachersHtml = await publicPage.content();
say(
  'public teachers page shows the new photo',
  teachersHtml.includes(`v%3D${stamp}`) || teachersHtml.includes(`v=${stamp}`),
);

if (courseSlug) {
  await publicPage.goto(`${base}/uz/courses/${courseSlug}`, { waitUntil: 'load' });
  const coursePage = await publicPage.content();
  say(
    'course detail page shows the new price',
    coursePage.includes(newPrice) ||
      coursePage.includes(newPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')),
  );
}

console.log(`page errors: ${errors.length ? errors.slice(0, 2).join(' | ') : 'none'}`);
pass &&= errors.length === 0;

await browser.close();
await prisma.$disconnect();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
