import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

/**
 * Admin localisation acceptance check: switching the panel language through the
 * switcher must translate *both* halves of the UI — server components (sidebar,
 * page headings, document title) and client components (forms, buttons).
 *
 * Server components read the locale from the `admin_locale` cookie via the
 * next-intl request config, so a regression there shows up as an Uzbek sidebar
 * next to a Russian form.
 */
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const messages = Object.fromEntries(
  ['uz', 'ru', 'en'].map((locale) => [
    locale,
    JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')),
  ]),
);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', (event) => errors.push(event.message));

let pass = true;
const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

// ---- sign in ----
await page.goto(`${base}/admin/login`, { waitUntil: 'load' });
await page.fill('#email', process.env.ADMIN_EMAIL ?? 'admin@school.uz');
await page.fill('#password', process.env.ADMIN_PASSWORD ?? 'ChangeMe123!');
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });

async function switchTo(locale) {
  await page.locator('select').first().selectOption(locale);
  // The switcher writes the cookie in a transition, then refreshes the tree.
  await page.waitForFunction(
    (expected) => document.cookie.includes(`admin_locale=${expected}`),
    locale,
    { timeout: 10_000 },
  );
  // Wait for the *server* re-render to land rather than guessing at a delay:
  // the sidebar is a server component, so its text is the signal.
  const expectedNav = messages[locale].admin.nav.dashboard;
  await page.locator('aside').filter({ hasText: expectedNav }).first().waitFor({ timeout: 15_000 });
}

for (const locale of ['uz', 'ru', 'en']) {
  const admin = messages[locale].admin;
  await page.goto(`${base}/admin`, { waitUntil: 'load' });
  await switchTo(locale);

  // Server component: the sidebar is rendered on the server.
  const nav = await page.locator('aside').innerText();
  const navOk = nav.includes(admin.nav.dashboard) && nav.includes(admin.nav.courses);
  say(
    `[${locale}] sidebar (server component) is translated`,
    navOk,
    navOk
      ? `${admin.nav.dashboard} / ${admin.nav.courses}`
      : `expected "${admin.nav.dashboard}" + "${admin.nav.courses}", got: ${nav.replace(/\s+/g, ' ').slice(0, 120)}`,
  );

  // Server component: page heading on a generic resource route.
  await page.goto(`${base}/admin/courses`, { waitUntil: 'load' });
  const heading = await page.locator('h1').first().innerText();
  const expectedHeading = admin.resources?.courses?.title ?? admin.nav.courses;
  say(`[${locale}] resource page heading is translated`, heading === expectedHeading, heading);

  // Server-rendered document title.
  say(
    `[${locale}] document title is translated`,
    (await page.title()).includes(expectedHeading) ||
      (await page.title()).includes(admin.nav.courses),
    await page.title(),
  );

  // Client component: the edit form's save button and field labels.
  await page.locator('li a[href^="/admin/courses/"]').first().click();
  await page.waitForSelector('[data-testid="admin-save"]');
  const saveLabel = await page.getByTestId('admin-save').innerText();
  say(
    `[${locale}] client form button is translated`,
    saveLabel.trim() === admin.common.save.trim(),
    saveLabel,
  );

  const formText = await page.locator('form, main').first().innerText();
  say(
    `[${locale}] no untranslated message keys leak into the page`,
    !/\b(admin|common)\.[a-zA-Z]+\.[a-zA-Z]+\b/.test(formText),
  );
}

console.log(`page errors: ${errors.length ? errors.slice(0, 2).join(' | ') : 'none'}`);
pass &&= errors.length === 0;

await browser.close();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
