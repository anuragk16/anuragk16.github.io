const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { ROOT } = require('./helpers');

const meta = (page, sel) => page.locator(sel).getAttribute('content');

test('meta and og tags', async ({ page }) => {
  await page.goto('/');
  expect(await meta(page, 'meta[property="og:title"]')).toBe('Anurag Kumawat — Software Engineer');
  expect(await meta(page, 'meta[property="og:image"]')).toBe('https://anuragk16.github.io/assets/og-image.png');
  expect(await meta(page, 'meta[property="og:url"]')).toBe('https://anuragk16.github.io/');
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  const desc = await meta(page, 'meta[name="description"]');
  expect(desc.length).toBeGreaterThanOrEqual(50);
  expect(desc.length).toBeLessThanOrEqual(160);
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://anuragk16.github.io/');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld['@type']).toBe('Person');
  expect(ld.worksFor.name).toBe('ColoredCow');
});

test('og image is 1200x630', () => {
  const buf = fs.readFileSync(path.join(ROOT, 'assets/og-image.png'));
  expect(buf.readUInt32BE(16)).toBe(1200);
  expect(buf.readUInt32BE(20)).toBe(630);
});

test('hero photo loads', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.hero-photo img');
  await expect(img).toHaveAttribute('alt', 'Anurag Kumawat');
  expect(await page.locator('.hero-photo source[type="image/webp"]').count()).toBe(1);
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  expect(await img.evaluate((el) => el.currentSrc)).toMatch(/anurag-(480|960)\.webp$/);
});

test('hero photo files are small', () => {
  for (const f of ['anurag-480.webp', 'anurag-960.webp', 'anurag-960.jpg']) {
    const size = fs.statSync(path.join(ROOT, 'assets/img', f)).size;
    expect(size, f).toBeLessThan(f.endsWith('.jpg') ? 160_000 : 80_000);
  }
});

test('favicon svg served', async ({ request }) => {
  const res = await request.get('/assets/logo.svg');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/svg+xml');
});
