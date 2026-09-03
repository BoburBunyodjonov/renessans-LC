import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.BASE_URL ?? 'http://localhost:3111';
const prisma = new PrismaClient();
const browser = await chromium.launch({ channel: 'chrome' });
const tmp = path.join(process.cwd(), '.tmp-check');
await mkdir(tmp, { recursive: true });
let pass = true;

const say = (label, ok, detail = '') => {
  pass &&= ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

// ---------- 1. filters are URL-synced and survive a reload ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/uz/materials/pdf`, { waitUntil: 'load' });
  await page.waitForSelector('button[aria-pressed]');

  const total = await page.locator('article').count();
  await page.getByRole('button', { name: 'IELTS', exact: true }).click();
  await page.waitForTimeout(400);
  const filtered = await page.locator('article').count();
  const url = new URL(page.url());
  say(
    'level chip filters and writes to the URL',
    filtered < total && url.searchParams.get('level') === 'IELTS',
    `${total} -> ${filtered}, ?${url.searchParams}`,
  );

  await page.getByPlaceholder(/qidirish/i).fill('Writing');
  await page.waitForTimeout(500);
  const searched = await page.locator('article').count();
  const withQuery = new URL(page.url());
  say(
    'search narrows and syncs to the URL',
    searched <= filtered && withQuery.searchParams.get('q') === 'Writing',
    `${filtered} -> ${searched}, q=${withQuery.searchParams.get('q')}`,
  );

  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('button[aria-pressed]');
  await page.waitForTimeout(400);
  const afterReload = await page.locator('article').count();
  const chipStillActive = await page
    .getByRole('button', { name: 'IELTS', exact: true })
    .getAttribute('aria-pressed');
  const queryStillThere = await page.getByPlaceholder(/qidirish/i).inputValue();
  say(
    'filters survive a reload',
    afterReload === searched && chipStillActive === 'true' && queryStillThere === 'Writing',
    `${afterReload} results, chip=${chipStillActive}, q="${queryStillThere}"`,
  );

  await page.getByRole('button', { name: /tozalash/i }).click();
  await page.waitForTimeout(400);
  const reset = await page.locator('article').count();
  say(
    'reset clears filters and the URL',
    reset === total && new URL(page.url()).search === '',
    `${reset} results`,
  );
  await page.close();
}

// ---------- 2. gated download opens the lead modal ----------
{
  const gated = await prisma.material.findFirst({
    where: { requireContact: true },
    select: { id: true },
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/uz/materials/pdf?q=Writing`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page
    .getByRole('button', { name: /Yuklab olish/i })
    .first()
    .click();
  // The dialog is a lazy chunk, so give it a moment to mount.
  const modal = await page
    .getByRole('dialog')
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false);
  say('gated material opens the lead modal', modal && Boolean(gated));

  if (modal) {
    await page.fill('#lead-name', 'Material Gate');
    await page.fill('#lead-phone', '+998 (97) 555-44-33');
    await page.getByRole('button', { name: /Yuborish/ }).click();
    await page.waitForTimeout(1500);
    const cookies = await page.context().cookies();
    const consent = cookies.find((c) => c.name === 'materials_consent');
    const lead = await prisma.lead.findFirst({
      where: { phone: '+998975554433' },
      select: { source: true },
    });
    say(
      'consent cookie set and MATERIAL_GATE lead stored',
      Boolean(consent) && lead?.source === 'MATERIAL_GATE',
      `cookie=${Boolean(consent)}, source=${lead?.source}`,
    );
  }
  await page.close();
}

// ---------- 3. CV upload ----------
{
  const pdf = Buffer.concat([
    Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
      'latin1',
    ),
  ]);
  const cvPath = path.join(tmp, 'rezyume.pdf');
  await writeFile(cvPath, pdf);

  const fakePath = path.join(tmp, 'malware.pdf');
  await writeFile(fakePath, Buffer.from('MZ\x90\x00 this is an executable pretending to be a pdf'));

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/uz/join-team/esl-ielts-instructor`, { waitUntil: 'load' });

  // a) a file whose bytes do not match its extension must be rejected
  await page.setInputFiles('#app-cv', fakePath);
  await page.fill('#app-name', 'Sohta Fayl');
  await page.fill('#app-phone', '+998 (99) 111-00-11');
  await page.check('input[type=checkbox]');
  await page.getByRole('button', { name: /Ariza topshirish/ }).click();
  await page.waitForTimeout(1200);
  const rejected = await page
    .getByText(/Fayl formati yoki hajmi mos emas/)
    .isVisible()
    .catch(() => false);
  const notStored =
    (await prisma.jobApplication.count({ where: { phone: '+998991110011' } })) === 0;
  say('CV with mismatched magic bytes is rejected', rejected && notStored);

  // b) a real PDF goes through
  await page.setInputFiles('#app-cv', cvPath);
  await page.fill('#app-name', 'Playwright Nomzod');
  await page.fill('#app-phone', '+998 (98) 222-33-44');
  await page.getByRole('button', { name: /Ariza topshirish/ }).click();
  await page.waitForSelector('text=Arizangiz qabul qilindi', { timeout: 15_000 });

  const application = await prisma.jobApplication.findFirst({
    where: { phone: '+998982223344' },
    include: { vacancy: { select: { slug: true } } },
  });
  say(
    'application stored with CV',
    Boolean(application?.cvUrl) &&
      application?.vacancy?.slug === 'esl-ielts-instructor' &&
      application?.status === 'NEW',
    `cv=${application?.cvUrl} name=${application?.cvName} status=${application?.status}`,
  );

  if (application?.cvUrl) {
    const res = await fetch(`${base}${application.cvUrl}`);
    const head = Buffer.from(await res.arrayBuffer())
      .subarray(0, 4)
      .toString('latin1');
    say(
      'stored CV is served from storage',
      res.ok && head === '%PDF',
      `${res.status}, magic="${head}"`,
    );
  }
  await page.close();
}

await rm(tmp, { recursive: true, force: true });
await browser.close();
await prisma.$disconnect();
console.log(pass ? '\nALL PASS' : '\nFAILURES');
process.exit(pass ? 0 : 1);
