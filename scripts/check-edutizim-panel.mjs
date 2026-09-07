import { chromium } from 'playwright';

/**
 * EduTizim connection panel acceptance check.
 *
 * The point of the panel is that a school connects itself: no server access, no
 * Mongo ids copied out of a URL. So this proves the four things that make that
 * true — the stored key is never in the page, a fresh key can be generated and
 * read back to be pasted into EduTizim, "test connection" really reaches
 * EduTizim and fills the branch list, and a survey number is exchanged for the
 * id an order is filed under.
 */
const base = process.env.BASE_URL ?? 'http://localhost:3111';
const KEY = process.env.EDUTIZIM_API_KEY ?? 'dev-renessans-site-8f3c91a7d2e64b05a9c1';
const SURVEY = process.env.EDUTIZIM_SURVEY ?? 's26';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

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

await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' });

// The key is write-only: the panel shows a masked hint, and the plaintext must
// not appear anywhere in the delivered HTML.
const html = await page.content();
say('stored key never reaches the browser', !html.includes(KEY));
say('key field is empty and masked', (await page.inputValue('#edu-key')) === '');
const hint = await page.getAttribute('#edu-key', 'placeholder');
say('masked hint shown', /^••••/.test(hint ?? ''), hint ?? 'none');

say('organisation prefilled', (await page.inputValue('#edu-org')) === 'husniddin');

// A generated key has to be legible: it exists to be copied into EduTizim by
// hand, and it is never shown again once saved.
await page.getByRole('button', { name: /Yaratish/ }).click();
const generated = await page.inputValue('#edu-key');
say('generate produces a key', /^renessans-site-[0-9a-f]{40}$/.test(generated), generated);
say('generated key is readable', (await page.getAttribute('#edu-key', 'type')) === 'text');
say(
  'the panel says to paste it into EduTizim',
  (await page.locator('text=/Lead Site Admittance/').count()) > 0,
);

const second = await (async () => {
  await page.getByRole('button', { name: /Yaratish/ }).click();
  return page.inputValue('#edu-key');
})();
say('each key is different', second !== generated);

// Back to the stored key, which is what the rest of the checks exercise.
await page.reload({ waitUntil: 'networkidle' });

// The connection test uses the stored key, since none was typed.
await page.getByRole('button', { name: /Ulanishni tekshirish/ }).click();
await page.waitForFunction(
  () => /Ulandi|filial/.test(document.body.innerText) || /HTTP|Error/.test(document.body.innerText),
  { timeout: 25_000 },
);
const connected = await page.locator('text=/Ulandi/').count();
say('connection test succeeds with the stored key', connected > 0);

const branchOptions = await page.locator('#edu-branch option').count();
say('branch list populated', branchOptions > 1, `${branchOptions} options`);

// A survey number becomes the id orders are filed under.
await page.fill('#edu-survey', SURVEY);
await page.getByRole('button', { name: /^Aniqlash$/ }).click();
await page.waitForFunction(() => /So‘rovnoma topildi/.test(document.body.innerText), {
  timeout: 25_000,
});
const resolved = await page.locator('text=/So‘rovnoma topildi/').first().innerText();
say('survey number resolves to an id', /[0-9a-f]{24}/.test(resolved), resolved);

// There is no separate "switch it on" step: a complete configuration says so,
// and the only remaining control is a deliberate pause.
const body = await page.locator('body').innerText();
say('no enable checkbox to forget', (await page.locator('input[type=checkbox]').count()) === 0);
say('completing the setup turns it on', /Yoqilgan —/.test(body));
await page.getByRole('button', { name: /Vaqtincha to‘xtatish/ }).click();
say(
  'pausing is possible and says what it means',
  /To‘xtatilgan —/.test(await page.locator('body').innerText()),
);

await browser.close();
console.log(pass ? '\nPASS' : '\nFAIL');
process.exit(pass ? 0 : 1);
