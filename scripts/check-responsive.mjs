import { chromium } from 'playwright';

const WIDTHS = [360, 390, 768, 1280, 1536];
const PAGES = [
  '/uz',
  '/uz/teachers',
  '/uz/courses/ielts',
  '/uz/parents-solutions',
  '/uz/contact',
  '/uz/privacy',
  '/uz/choose-level',
  '/uz/tests/level-kids',
  '/uz/materials',
  '/uz/materials/pdf',
  '/uz/materials/photo',
  '/uz/join-team',
  '/uz/join-team/administrator',
  '/uz/blog',
  '/uz/blog/ielts-7-uchun-3-oylik-reja',
  '/ru',
  '/en',
];
const base = process.env.BASE_URL ?? 'http://localhost:3111';

const browser = await chromium.launch({ channel: 'chrome' });
let failures = 0;

for (const path of PAGES) {
  const results = [];
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url().slice(0, 120)}`);
    });
    await page.goto(base + path, { waitUntil: 'load', timeout: 45_000 });
    await page.waitForTimeout(600);
    const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > docWidth + 1)
        .slice(0, 3)
        .map((el) => el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 40));
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: docWidth,
        offenders,
      };
    });
    const overflow = scrollWidth > clientWidth + 1;
    if (overflow || errors.length) failures++;
    // Print every error in full: truncated console text is not diagnosable, and
    // these are usually intermittent, so there may be no second chance to catch one.
    for (const error of errors) console.error(`  ${path} @ ${width}px — ${error}`);
    results.push(
      `${width}px ${overflow ? `OVERFLOW ${scrollWidth}>${clientWidth} ${offenders.join(', ')}` : 'ok'}${errors.length ? ' ERR:' + errors[0].slice(0, 200) : ''}`,
    );
    await context.close();
  }
  console.log(path.padEnd(26), results.join(' | '));
}

await browser.close();
console.log(failures === 0 ? '\nAll viewports clean.' : `\n${failures} problem(s).`);
process.exit(failures === 0 ? 0 : 1);
