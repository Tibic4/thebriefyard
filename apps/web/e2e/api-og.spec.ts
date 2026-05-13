import { expect, test } from '@playwright/test';

test('GET /api/og/<seed>?j=logo&i=food&l=en returns a PNG', async ({ request }) => {
  const res = await request.get('/api/og/a7f3c2?j=logo&i=food&l=en');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
  const buf = await res.body();
  // PNG signature
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
});
