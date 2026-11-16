const { test, expect } = require('@playwright/test');

const theme = (page) => page.locator('html').getAttribute('data-theme');

test('defaults to system dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await theme(page)).toBe('dark');
});

test('defaults to system light', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await theme(page)).toBe('light');
});

test('toggle flips theme, aria and stores', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const btn = page.locator('#theme-toggle');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await btn.click();
  expect(await theme(page)).toBe('dark');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(btn).toHaveAttribute('aria-label', 'Switch to light theme');
  expect(await page.evaluate(() => localStorage.getItem('ak-theme'))).toBe('dark');
});

test('stored choice beats system', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ak-theme', 'light'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await theme(page)).toBe('light');
});

test('no-flash: dark system loads dark before scripts', async ({ page }) => {
  await page.route('**/js/*.js', (route) => route.abort());
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await theme(page)).toBe('dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(15, 20, 17)');
});

test('toggle works when localStorage throws', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('#theme-toggle').click();
  expect(await theme(page)).toBe('dark');
  expect(errors).toEqual([]);
});

test('switch glyph rotates in dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  const t = await page.locator('#theme-toggle .switch-peak').evaluate((el) => getComputedStyle(el).transform);
  expect(t).not.toBe('none');
});
