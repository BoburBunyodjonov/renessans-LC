import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
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
await page.locator('form button[type="submit"]').click();
await page.waitForTimeout(2500);
// Assert the outcome, not the wording: the copy is translated now.
const stillOnLogin = page.url().includes('/admin/login');
const errorShown = await page
  .locator('[role="alert"], [data-error], .text-danger, [aria-live]')
  .first()
  .isVisible()
  .catch(() => false);
say('wrong password is rejected', stillOnLogin && errorShown, page.url());

await page.fill('#password', password);
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
say('valid credentials sign in', !page.url().includes('/admin/login'), page.url());

// ---------- dashboard ----------
// Wait for the panel to actually render: waitForURL resolves while the
// dashboard is still streaming, and the labels come from the message files
// rather than being hardcoded here, so a translation change cannot fail this.
const uz = JSON.parse(readFileSync(new URL('../messages/uz.json', import.meta.url), 'utf8'));
const leadsToday = uz.admin.dash.leadsToday;
await page.waitForSelector('main h1', { timeout: 20_000 });
await page.getByText(leadsToday, { exact: false }).first().waitFor({ timeout: 20_000 });
const dashboardText = await page.locator('main').innerText();
say(
  'dashboard renders KPI cards',
  dashboardText.includes(leadsToday) && dashboardText.includes(uz.admin.dash.attempts),
  leadsToday,
);

// ---------- generic resource list + reorder view ----------
await page.goto(`${base}/admin/advantages`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const advantageCount = await page.locator('li:has(a[href^="/admin/advantages/"])').count();
say('advantages list renders seeded rows', advantageCount >= 5, `${advantageCount} rows`);

// ---------- edit a record and see it change in the database ----------
// Scope to list rows: a bare href match also picks up the "New" button.
await page.locator('li a[href^="/admin/advantages/"]').first().click();
await page.waitForSelector('#field-title');
// Query the row we actually opened rather than assuming it sorts first.
const editedId = new URL(page.url()).pathname.split('/').pop();
const stamp = `Admin test ${Date.now() % 100000}`;
await page.fill('#field-title', stamp);
await page.getByTestId('admin-save').click();
// Wait for the save toast instead of a fixed delay: a cold dev compile can
// take longer than any timeout worth hard-coding. The selector is sonner's
// own attribute, so this stays language-agnostic.
await page.waitForSelector('[data-sonner-toast]', { timeout: 20_000 });

const advantage = await prisma.advantage.findUnique({ where: { id: editedId } });
if (!advantage) console.log(`  (debug) no advantage row for id "${editedId}"`);
const savedTitle =
  advantage?.title && typeof advantage.title === 'object' ? advantage.title.uz : null;
say('edit persists to the database', savedTitle === stamp, `title.uz = "${savedTitle}"`);

// ---------- audit log written ----------
const audit = await prisma.auditLog.findFirst({
  where: { entity: 'advantages', entityId: editedId },
  orderBy: { createdAt: 'desc' },
});
say(
  'audit entry written for the edited record',
  audit?.action === 'UPDATE',
  `${audit?.action} ${audit?.entity} ${audit?.entityId}`,
);

console.log(`page errors: ${errors.length ? errors.slice(0, 2).join(' | ') : 'none'}`);
pass &&= errors.length === 0;

await browser.close();
await prisma.$disconnect();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
