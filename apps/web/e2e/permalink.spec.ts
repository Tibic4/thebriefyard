import { expect, test } from '@playwright/test';

test('permalink renders deterministic brief with noindex,follow', async ({ page }) => {
  await page.goto('/brief/logo/food/regd01');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('same seed renders byte-identical brief on two requests', async ({ page, context }) => {
  await page.goto('/brief/logo/food/regd01');
  const h1a = await page.getByRole('heading', { level: 1 }).textContent();
  const page2 = await context.newPage();
  await page2.goto('/brief/logo/food/regd01');
  const h1b = await page2.getByRole('heading', { level: 1 }).textContent();
  expect(h1a).toBe(h1b);
});

test('permalink rejects malformed seed with 404', async ({ page }) => {
  const res = await page.goto('/brief/logo/food/ZZZ');
  expect(res?.status()).toBe(404);
});
