const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
});

test('project card expands and collapses', async ({ page }) => {
  const toggle = page.locator('#project-field .project-toggle');
  const details = page.locator('#project-field-details');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
  await toggle.click();
  await expect(details).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(details).toBeHidden();
});

test('skill highlights its projects', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover covered by focus test on touch');
  await page.locator('.skill[data-projects="field"]').hover();
  await expect(page.locator('#project-field')).toHaveClass(/is-linked/);
  await expect(page.locator('#project-cert')).not.toHaveClass(/is-linked/);
  await expect(page.locator('.skill[data-projects="field"]')).toHaveClass(/is-active/);
});

test('earlier work show more', async ({ page }) => {
  const visible = () => page.locator('#earlier-list .mini:visible').count();
  expect(await visible()).toBe(3);
  const btn = page.locator('#earlier-toggle');
  await expect(btn).toHaveText('Show more');
  await btn.click();
  expect(await visible()).toBe(await page.locator('#earlier-list .mini').count());
  await expect(btn).toHaveText('Show less');
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
});

test('keyboard operates all controls', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard path tested on desktop');
  await page.locator('#theme-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const toggle = page.locator('#project-cert .project-toggle');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await page.locator('.skill[data-projects="lms"]').focus();
  await expect(page.locator('#project-lms')).toHaveClass(/is-linked/);

  await page.locator('#earlier-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#earlier-toggle')).toHaveAttribute('aria-expanded', 'true');
});

test('tab order reaches the theme switch', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard path tested on desktop');
  let found = false;
  for (let i = 0; i < 12 && !found; i++) {
    await page.keyboard.press('Tab');
    found = await page.evaluate(() => document.activeElement && document.activeElement.id === 'theme-toggle');
  }
  expect(found).toBe(true);
});
