import { expect, test } from '@playwright/test';

test('/about renders with canonical', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: /about/i })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://thebriefyard.com/about',
  );
});

test('/faq renders with FAQPage JSON-LD', async ({ page }) => {
  await page.goto('/faq');
  await expect(page.getByRole('heading', { level: 1, name: /FAQ/i })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').count();
  expect(ld).toBeGreaterThanOrEqual(1);
  const jsonText = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonText).toContain('"@type":"FAQPage"');
});

test('/newsletter renders with form CTA', async ({ page }) => {
  await page.goto('/newsletter');
  await expect(page.getByRole('heading', { level: 1, name: /newsletter/i })).toBeVisible();
});
