import { expect, test } from '@playwright/test';
import { cleanupLead, prisma, uniquePhone } from './helpers';

test.describe('lead capture', () => {
  test('a visitor can request a trial lesson from a course card', async ({ page }) => {
    const phone = uniquePhone();
    await cleanupLead(phone.e164);

    await page.goto('/uz');

    // Open the modal from a course card CTA.
    await page.locator('#services').scrollIntoViewIfNeeded();
    await page
      .locator('#services')
      .getByRole('button', { name: /Birinchi darsga yozilish/ })
      .first()
      .click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.locator('#lead-name').fill('E2E Ota-ona');
    await modal.locator('#lead-phone').fill(phone.masked);
    await modal.getByRole('button', { name: /Yuborish/ }).click();

    // The visitor stays on the page and sees an inline success state.
    await expect(modal.getByText('Arizangiz qabul qilindi!')).toBeVisible();
    await expect(page).toHaveURL(/\/uz$/);

    const lead = await prisma.lead.findFirst({
      where: { phone: phone.e164 },
      include: { course: { select: { slug: true } } },
    });

    expect(lead).not.toBeNull();
    expect(lead?.name).toBe('E2E Ota-ona');
    expect(lead?.source).toBe('COURSE_CARD');
    expect(lead?.status).toBe('NEW');
    expect(lead?.courseId).not.toBeNull();
    expect(lead?.ipHash).toBeTruthy();
    // The raw IP is never stored, only its hash.
    expect(lead?.ipHash).not.toContain('.');

    await cleanupLead(phone.e164);
  });

  test('an invalid phone number is rejected before submission', async ({ page }) => {
    await page.goto('/uz/contact');

    await page.locator('#contact-name').fill('E2E Test');
    await page.locator('#contact-phone').fill('+998 (90) 12');
    await page.locator('#contact-message').fill('Sinov darsi haqida savol');
    await page.getByRole('button', { name: /^Yuborish$/ }).click();

    await expect(page.getByText(/Telefon raqam noto.g.ri kiritilgan/)).toBeVisible();
  });

  test('a filled honeypot is accepted but stores nothing', async ({ page, request, baseURL }) => {
    const phone = uniquePhone();
    await cleanupLead(phone.e164);

    await page.goto('/uz');
    const response = await request.post('/api/leads', {
      data: { name: 'Spam Bot', phone: phone.e164, source: 'HERO', hp: 'gotcha' },
      headers: { origin: new URL(baseURL!).origin },
    });

    expect(response.ok()).toBe(true);
    expect(await prisma.lead.count({ where: { phone: phone.e164 } })).toBe(0);
  });
});
