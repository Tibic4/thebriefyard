import { expect, test } from '@playwright/test';

test('GET /sitemap.xml lists statics + hub for existing pair, both locales', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/xml/);
  const xml = await res.text();
  expect(xml).toContain('https://thebriefyard.com');
  expect(xml).toContain('https://thebriefyard.com/pt');
  expect(xml).toContain('https://thebriefyard.com/brief/logo/food');
  expect(xml).toContain('https://thebriefyard.com/pt/brief/logo/food');
  // Ad-hoc permalinks never in sitemap
  expect(xml).not.toMatch(/\/brief\/logo\/food\/[a-z0-9]{6}/);
});

test('GET /robots.txt allows everything and points to sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/User-Agent:\s*\*/i);
  expect(text).toContain('Sitemap: https://thebriefyard.com/sitemap.xml');
});
