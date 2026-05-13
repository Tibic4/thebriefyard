import { expect, test } from '@playwright/test';

test('home renders the foundation scaffold (EN)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'thebriefyard' })).toBeVisible();
  await expect(page.getByText(/Practice briefs for designers/)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('PT route renders with lang=pt', async ({ page }) => {
  await page.goto('/pt');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  await expect(page.getByText(/Briefings de prática/)).toBeVisible();
});
