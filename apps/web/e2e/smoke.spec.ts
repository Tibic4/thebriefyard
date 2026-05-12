import { expect, test } from '@playwright/test';

test('home renders the foundation scaffold', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'thebriefyard' })).toBeVisible();
  await expect(page.getByText(/Practice briefs for designers/)).toBeVisible();
});
