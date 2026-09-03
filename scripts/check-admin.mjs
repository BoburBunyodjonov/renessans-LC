import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const base = process.env.BASE_URL ?? 'http://localhost:3111';
const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@school.uz';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

const prisma = new PrismaClient();
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

let pass = true;
const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

// ---------- login ----------
await page.goto(`${base}/admin`, { waitUntil: 'load' });
say('unauthenticated /admin redirects to login', page.url().includes('/admin/login'), page.url());

await page.fill('#email', email);
await page.fill('#password', 'wrong-password');
await page.getByRole('button', { name: 'Kirish' }).click();
await page.waitForTimeout(1500);
say(
  'wrong password is rejected',
  await page
    .getByText('Email yoki parol noto‘g‘ri')
    .isVisible()
    .catch(() => false),
);

await page.fill('#password', password);
await page.getByRole('button', { name: 'Kirish' }).click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
say('valid credentials sign in', !page.url().includes('/admin/login'), page.url());

// ---------- dashboard ----------
const dashboardText = await page.locator('body').innerText();
say(
  'dashboard renders KPI cards',
  dashboardText.includes('Bugungi arizalar') && dashboardText.includes('Konversiya'),
);

// ---------- generic resource list + reorder view ----------
await page.goto(`${base}/admin/advantages`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const advantageCount = await page.locator('li:has-text("Tahrirlash")').count();
say('advantages list renders seeded rows', advantageCount >= 5, `${advantageCount} rows`);

// ---------- edit a record and see it change in the database ----------
await page.getByRole('link', { name: 'Tahrirlash' }).first().click();
await page.waitForSelector('#field-title');
const stamp = `Admin test ${Date.now() % 100000}`;
await page.fill('#field-title', stamp);
await page.getByRole('button', { name: 'Saqlash' }).click();
await page.waitForTimeout(2000);

const advantage = await prisma.advantage.findFirst({ orderBy: { order: 'asc' } });
const savedTitle =
  advantage?.title && typeof advantage.title === 'object' ? advantage.title.uz : null;
say('edit persists to the database', savedTitle === stamp, `title.uz = "${savedTitle}"`);

// ---------- audit log written ----------
const audit = await prisma.auditLog.findFirst({
  where: { entity: 'advantages' },
  orderBy: { createdAt: 'desc' },
});
say('audit entry written', audit?.action === 'UPDATE', `${audit?.action} ${audit?.entity}`);

console.log(`page errors: ${errors.length ? errors.slice(0, 2).join(' | ') : 'none'}`);
pass &&= errors.length === 0;

await browser.close();
await prisma.$disconnect();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
