import { expect, test } from '@playwright/test';
import { cleanupLead, prisma, uniquePhone } from './helpers';

test.describe('placement test', () => {
  test('a full run scores correctly, shows the band and creates a linked lead', async ({
    page,
  }) => {
    const phone = uniquePhone();
    await cleanupLead(phone.e164);

    // Answer key straight from the database.
    const questions = await prisma.testQuestion.findMany({
      where: { isActive: true, category: { slug: 'level-general' } },
      orderBy: { order: 'asc' },
      select: { prompt: true, options: { orderBy: { order: 'asc' }, select: { isCorrect: true } } },
    });
    expect(questions.length).toBeGreaterThan(0);

    const correctIndexByPrompt = new Map(
      questions.map((question) => [
        question.prompt.trim(),
        question.options.findIndex((option) => option.isCorrect),
      ]),
    );

    await page.goto('/uz/choose-level');
    await page
      .getByRole('link', { name: /Davom etish/ })
      .last()
      .click();
    await page.waitForURL(/\/uz\/tests\//);

    // The test never ships the answer key to the browser.
    const runnerHtml = await page.content();
    expect(runnerHtml).not.toContain('isCorrect');

    for (let index = 0; index < questions.length; index += 1) {
      const prompt = (await page.locator('p.whitespace-pre-line').first().innerText()).trim();
      const correct = correctIndexByPrompt.get(prompt);
      expect(correct, `unknown prompt: ${prompt}`).not.toBeUndefined();

      await page.locator('button[aria-pressed]').nth(correct!).click();
      await page.getByRole('button', { name: /Keyingi|Yakunlash/ }).click();
    }

    // Contact gate stands between the last question and the result.
    await expect(page.locator('#gate-name')).toBeVisible();
    await page.locator('#gate-name').fill('E2E Talaba');
    await page.locator('#gate-phone').fill(phone.masked);
    await page.getByRole('button', { name: /Natijani ko/ }).click();

    await expect(page.getByRole('button', { name: 'Testni qayta topshirish' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Upper-Intermediate/ })).toBeVisible();
    // "To‘g‘ri javoblar: 45/45" — a perfect run.
    await expect(
      page.getByText(`${questions.length}/${questions.length}`, { exact: false }).first(),
    ).toBeVisible();

    const attempt = await prisma.testAttempt.findFirst({
      where: { phone: phone.e164 },
      orderBy: { createdAt: 'desc' },
      include: { lead: true, category: { select: { slug: true } } },
    });

    expect(attempt?.score).toBe(questions.length);
    expect(attempt?.maxScore).toBe(questions.length);
    expect(attempt?.levelName).toBe('Upper-Intermediate');
    expect(attempt?.category.slug).toBe('level-general');
    expect(Array.isArray(attempt?.answers) ? attempt.answers.length : 0).toBe(questions.length);
    expect(attempt?.lead?.source).toBe('TEST_RESULT');
    expect(attempt?.lead?.name).toBe('E2E Talaba');

    // Finishing clears the resume key.
    const leftover = await page.evaluate(() =>
      window.localStorage.getItem('placement-test:level-general'),
    );
    expect(leftover).toBeNull();

    await prisma.testAttempt.deleteMany({ where: { phone: phone.e164 } });
    await cleanupLead(phone.e164);
  });

  test('an interrupted run can be resumed', async ({ page }) => {
    // The Kids paper is answered in writing rather than by choosing.
    await page.goto('/uz/tests/level-kids');
    await page.waitForSelector('#answer');

    for (let index = 0; index < 3; index += 1) {
      await page.fill('#answer', 'car');
      await page.getByRole('button', { name: /Keyingi/ }).click();
    }

    const before = await page.locator('p.tabular-nums').first().innerText();
    await page.reload();

    await expect(page.getByText('Tugallanmagan test topildi')).toBeVisible();
    await page.getByRole('button', { name: 'Davom ettirish' }).click();

    await expect(page.locator('p.tabular-nums').first()).toHaveText(before);

    // Leave no state behind for the next spec.
    await page.evaluate(() => window.localStorage.clear());
  });
});
