import { chromium } from 'playwright';

/**
 * Brand colour acceptance check.
 *
 * The palette is generated from one colour chosen in the admin and injected by
 * the root layouts, so the failure modes are not visual-only: the site can keep
 * serving a cached page in the old colour, or the derived stop that carries
 * white text can drift under the AA threshold. This changes the colour for
 * real, checks what the public site actually paints, and puts it back.
 */
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const TEST_COLOUR = '#2563eb'; // blue — nothing like the shipped red
const DEFAULT_COLOUR = '#e63329';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await context.newPage();

let pass = true;
const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

const rgbToHex = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

// Reads --color-brand-600 as the browser resolves it, which is what every
// `bg-brand-600` on the page is actually painted with.
const readBrand600 = async (target) => {
  await target.goto(`${base}/uz`, { waitUntil: 'networkidle' });
  const value = await target.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-brand-600').trim(),
  );
  return value.startsWith('rgb') ? rgbToHex(value) : value.toLowerCase();
};

async function setBrandColour(hex) {
  await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#field-brandColor');
  await page.fill('input[type="text"][aria-describedby="brand-colour-hint"]', hex);
  await page.getByTestId('admin-save').click();
  await page.waitForSelector('[data-sonner-toast]', { timeout: 20_000 });
  await page.waitForTimeout(1200);
}

// ---- sign in ----
await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' });
await page.fill('#email', process.env.ADMIN_EMAIL ?? 'admin@school.uz');
await page.fill('#password', process.env.ADMIN_PASSWORD ?? 'ChangeMe123!');
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });

// A separate context stands in for a visitor: no admin cookies, no draft mode.
const visitor = await browser.newContext();
const visitorPage = await visitor.newPage();

const before = await readBrand600(visitorPage);
say('public site starts on the stored colour', before.length === 7, before);

await setBrandColour(TEST_COLOUR);
const after = await readBrand600(visitorPage);
say(
  'changing the colour in the admin repaints the public site',
  after !== before,
  `${before} → ${after}`,
);

// A colour that already clears AA is used as-is, so "differs from the input"
// is not the invariant — readability is, and it is checked below. What must
// hold is that a colour too light for white text gets darkened.

const contrast = await visitorPage.evaluate((hex) => {
  const lum = (h) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const l = lum(hex);
  return 1.05 / (l + 0.05);
}, after);
say('white text on the derived button clears WCAG AA', contrast >= 4.5, `${contrast.toFixed(2)}:1`);

// Yellow is the case that proves the derivation: white text on it is 1.7:1,
// so the stored colour and the painted button cannot be the same.
await setBrandColour('#facc15');
const yellow = await readBrand600(visitorPage);
say('a colour too light for white text is darkened', yellow !== '#facc15', `#facc15 → ${yellow}`);

await setBrandColour(TEST_COLOUR);

// The admin panel wears the same brand.
await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
const adminBrand = await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--color-brand-600').trim(),
);
const adminHex = adminBrand.startsWith('rgb') ? rgbToHex(adminBrand) : adminBrand.toLowerCase();
say('the admin panel follows the same brand', adminHex === after, adminHex);

// ---- put it back ----
await setBrandColour(DEFAULT_COLOUR);
const restored = await readBrand600(visitorPage);
say('resetting restores the shipped palette', restored === before, `${restored}`);

await browser.close();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
