import { expect, test } from '@playwright/test';
import { prisma } from './helpers';

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@school.uz';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

test.describe('admin panel', () => {
  test('the panel is closed to anonymous visitors', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill('definitely-wrong');
    await page.locator('form button[type="submit"]').click();

    // Asserted by role, not wording: the admin UI is translatable.
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('an editor changes content and the public site reflects it', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);

    await page.goto('/admin/login');
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/admin$/);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Edit an advantage card — small, visible on the homepage, easy to restore.
    const original = await prisma.advantage.findFirst({ orderBy: { order: 'asc' } });
    expect(original).not.toBeNull();

    await page.goto(`/admin/advantages/${original!.id}`);
    await page.waitForSelector('#field-title');

    const heading = `E2E afzallik ${stamp}`;
    await page.locator('#field-title').fill(heading);
    await page.getByTestId('admin-save').click();
    // Sonner renders the toast into a status region.
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible();

    const saved = await prisma.advantage.findUnique({ where: { id: original!.id } });
    expect((saved?.title as { uz?: string })?.uz).toBe(heading);

    // The public homepage picks it up without a redeploy.
    const publicPage = await page.context().newPage();
    await publicPage.goto('/uz');
    await expect(publicPage.getByText(heading)).toBeVisible();
    await publicPage.close();

    // An audit entry records who changed what.
    const audit = await prisma.auditLog.findFirst({
      where: { entity: 'advantages', entityId: original!.id },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit?.action).toBe('UPDATE');
    expect(audit?.userId).toBeTruthy();

    // Restore the seeded copy.
    await prisma.advantage.update({
      where: { id: original!.id },
      data: { title: original!.title as never },
    });
  });

  test('the admin panel is excluded from search engines', async ({ page, request }) => {
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toContain('Disallow: /admin');

    await page.goto('/admin/login');
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robotsMeta).toContain('noindex');
  });
});
