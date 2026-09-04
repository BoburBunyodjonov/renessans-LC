import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

// The seed ships a single SUPER_ADMIN, so provision the EDITOR this check needs
// rather than depending on a user left behind by an earlier run.
const EDITOR_EMAIL = 'editor@school.uz';
const EDITOR_PASSWORD = 'EditorPass123!';
const passwordHash = await bcrypt.hash(EDITOR_PASSWORD, 12);
await prisma.user.upsert({
  where: { email: EDITOR_EMAIL },
  update: { passwordHash, role: 'EDITOR', isActive: true },
  create: {
    email: EDITOR_EMAIL,
    name: 'Editor (check)',
    passwordHash,
    role: 'EDITOR',
    isActive: true,
  },
});

// ---- sign in as the EDITOR ----
await page.goto(`${base}/admin/login`, { waitUntil: 'load' });
await page.fill('#email', EDITOR_EMAIL);
await page.fill('#password', EDITOR_PASSWORD);
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
say('editor signs in', !page.url().includes('login'));

// EDITOR must not see admin-only sections
const navText = await page.locator('aside').innerText();
say(
  'editor cannot see Users / Audit in the sidebar',
  !navText.includes('Foydalanuvchilar') && !navText.includes('Audit'),
);

// Server-side guard, not just hidden UI. Assert on what actually rendered:
// `redirect()` serves the dashboard, but Next does not always rewrite the
// address bar, so the URL is not the property worth testing — the absence of
// user data is.
// A denied route answers with a redirect the client resolves itself, which
// Playwright surfaces as an aborted navigation — expected, not a failure.
const visitDenied = async (path) => {
  await page.goto(`${base}${path}`, { waitUntil: 'load' }).catch(() => {});
  await page.waitForSelector('aside', { timeout: 15_000 });
  return page.locator('body').innerText();
};

const usersBody = await visitDenied('/admin/users');
say(
  'editor is denied /admin/users (dashboard served, no user records)',
  !usersBody.includes('admin@school.uz') && !usersBody.includes(EDITOR_EMAIL),
  page.url(),
);

const auditBody = await visitDenied('/admin/audit');
say(
  'editor is denied /admin/audit',
  !auditBody.includes('LOGIN') && !auditBody.includes('UPDATE'),
  page.url(),
);

// ---- 1. hero headline ----
await page.goto(`${base}/admin/hero`, { waitUntil: 'load' });
await page.locator('li a[href^="/admin/hero/"]').first().click();
await page.waitForSelector('#field-headline');
const heroId = new URL(page.url()).pathname.split('/').pop();
const headline = `Kafolatlangan <mark>IELTS 7+</mark> — ${stamp}`;
await page.fill('#field-headline', headline);
await page.getByTestId('admin-save').click();
await page.waitForSelector('[data-sonner-toast]', { timeout: 20_000 });
await page.waitForTimeout(300);

// ---- 2. course price ----
await page.goto(`${base}/admin/courses`, { waitUntil: 'load' });
await page.locator('li a[href^="/admin/courses/"]').first().click();
await page.waitForSelector('#field-price');
const courseId = new URL(page.url()).pathname.split('/').pop();
const newPrice = `9${stamp}0`;
await page.fill('#field-price', newPrice);
await page.getByTestId('admin-save').click();
await page.waitForSelector('[data-sonner-toast]', { timeout: 20_000 });
await page.waitForTimeout(300);

const courseSlug = await page.evaluate(() => document.querySelector('#field-slug')?.value ?? null);

// ---- 3. teacher photo ----
await page.goto(`${base}/admin/teachers`, { waitUntil: 'load' });
await page.locator('li a[href^="/admin/teachers/"]').first().click();
await page.waitForSelector('input[placeholder="https://..."]');
const teacherId = new URL(page.url()).pathname.split('/').pop();
const photo = `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1067&fit=crop&q=80&v=${stamp}`;
await page.locator('input[placeholder="https://..."]').first().fill(photo);
await page.getByTestId('admin-save').click();
await page.waitForSelector('[data-sonner-toast]', { timeout: 20_000 });
await page.waitForTimeout(300);

// ---- database state ----
const [hero, course, teacher] = await Promise.all([
  prisma.heroSlide.findUnique({ where: { id: heroId } }),
  prisma.course.findUnique({ where: { id: courseId } }),
  prisma.teacher.findUnique({ where: { id: teacherId } }),
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
