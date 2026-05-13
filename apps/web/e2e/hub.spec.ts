import { expect, test } from '@playwright/test';

test('hub /brief/logo/food renders with canonical + hreflang + JSON-LD', async ({ page }) => {
  await page.goto('/brief/logo/food');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://thebriefyard.com/brief/logo/food',
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[hreflang="pt"]')).toHaveCount(1);
  // CollectionPage + BreadcrumbList JSON-LD scripts in the body.
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  // Body shows the industry blurb.
  await expect(page.getByText(/Designing for food brands/)).toBeVisible();
});

test('hub /pt/brief/logo/food renders PT lang attribute', async ({ page }) => {
  await page.goto('/pt/brief/logo/food');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
});

test('hub for an unauthored pair returns 404', async ({ page }) => {
  const res = await page.goto('/brief/logo/tech');
  expect(res?.status()).toBe(404);
});
