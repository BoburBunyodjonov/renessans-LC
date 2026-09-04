import { chromium } from 'playwright';

/**
 * Admin theme acceptance check.
 *
 * Dark mode is admin-only and driven by `--admin-*` tokens that the `.dark`
 * block swaps. The failure mode is silent: a component that reaches for a
 * public-site colour (`bg-white`, `text-ink-900`, `text-brand-600`) keeps its
 * light value while everything around it flips, so text turns invisible rather
 * than merely ugly — the admin document itself once stayed light while its text
 * went near-white, at 1.02:1.
 *
 * So this walks both themes and fails on text below the WCAG AA threshold for
 * its size, and on any large near-white surface while dark mode is on.
 */
const base = process.env.BASE_URL ?? 'http://localhost:3111';
const PAGES = [
  '/admin',
  '/admin/leads',
  '/admin/courses',
  '/admin/media',
  '/admin/settings',
  '/admin/users',
  '/admin/advantages/new',
];

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await context.newPage();

let pass = true;
const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' });
await page.fill('#email', process.env.ADMIN_EMAIL ?? 'admin@school.uz');
await page.fill('#password', process.env.ADMIN_PASSWORD ?? 'ChangeMe123!');
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });

const SCAN = `(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?\\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const effectiveBackground = (el) => {
    let node = el;
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.9) return bg;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const dark = document.documentElement.classList.contains('dark');
  const problems = [];

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || el.offsetParent === null) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) continue;

    if (dark) {
      const own = parse(cs.backgroundColor);
      if (own && own.a > 0.8 && lum(own) > 0.75 && rect.width > 20 && rect.height > 12) {
        problems.push('light surface ' + cs.backgroundColor + ' on .' + String(el.className).slice(0, 50));
      }
    }

    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('').trim();
    if (!text) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const bg = effectiveBackground(el);
    const size = parseFloat(cs.fontSize);
    const needed = size >= 24 || (+cs.fontWeight >= 700 && size >= 18.66) ? 3 : 4.5;
    const contrast = ratio(fg, bg);
    if (contrast < needed) {
      problems.push(contrast.toFixed(2) + ':1 (needs ' + needed + ') "' + text.slice(0, 30) + '" ' + cs.color + ' on rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')');
    }
  }
  return { dark, problems: [...new Set(problems)] };
})()`;

for (const theme of ['dark', 'light']) {
  await page.evaluate((value) => localStorage.setItem('admin-theme', value), theme);

  for (const path of PAGES) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const { dark, problems } = await page.evaluate(SCAN);
    say(
      `[${theme}] ${path}`,
      dark === (theme === 'dark') && problems.length === 0,
      problems.length ? problems.slice(0, 3).join(' | ') : '',
    );
  }
}

await browser.close();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
