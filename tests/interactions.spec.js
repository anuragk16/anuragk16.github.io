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

test('clipped controls keep a visible focus ring', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard path tested on desktop');
  await page.keyboard.press('Tab'); // enter keyboard modality so :focus-visible applies
  for (const sel of ['.hero-actions .btn-primary', '.social a', '#earlier-toggle', '.contact-links .btn']) {
    const el = page.locator(sel).first();
    await el.focus();
    const offset = await el.evaluate((e) => parseFloat(getComputedStyle(e).outlineOffset));
    expect(offset, sel).toBeLessThanOrEqual(-2);
  }
});

test('each skill says where it was used', async ({ page }) => {
  const skills = page.locator('#skills .skill');
  const n = await skills.count();
  for (let i = 0; i < n; i++) await expect(skills.nth(i).locator('.skill-used')).toContainText('Used in');
  await expect(page.locator('.skill[data-projects="lms"] .skill-used')).toContainText('Health-worker training platform');
});

test('clicking a skill scrolls to the work that proves it', async ({ page }) => {
  await page.locator('.skill[data-projects="lms"]').click();
  const card = page.locator('#project-lms');
  await expect(card).toHaveClass(/is-linked/);
  await expect(card).toBeInViewport();
});

test('opening one card does not stretch its neighbour', async ({ page, isMobile }) => {
  test.skip(isMobile, 'cards stack in one column on phones');
  const field = page.locator('#project-field');
  const before = (await field.boundingBox()).height;
  await page.locator('#project-lms .project-toggle').click();
  await expect(page.locator('#project-lms-details')).toBeVisible();
  const after = (await field.boundingBox()).height;
  expect(after).toBeCloseTo(before, 0);
  await expect(page.locator('#project-field-details')).toBeHidden();
});

test('side cards share a row on desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'cards stack on phones');
  const f = await page.locator('#project-field').boundingBox();
  const l = await page.locator('#project-lms').boundingBox();
  expect(Math.abs(f.y - l.y)).toBeLessThan(1);
  expect(l.x).toBeGreaterThan(f.x + f.width);
});

test('side card details open in one full-width panel below both cards', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout');
  const grid = await page.locator('#work .projects').boundingBox();
  const f0 = await page.locator('#project-field').boundingBox();
  const l0 = await page.locator('#project-lms').boundingBox();
  await page.locator('#project-field .project-toggle').click();
  const panel = page.locator('#project-field-details');
  await expect(panel).toBeVisible();
  const pb = await panel.boundingBox();
  expect(Math.abs(pb.x - grid.x)).toBeLessThan(1);
  expect(Math.abs(pb.width - grid.width)).toBeLessThan(1);
  const f1 = await page.locator('#project-field').boundingBox();
  const l1 = await page.locator('#project-lms').boundingBox();
  expect(pb.y).toBeGreaterThan(Math.max(f1.y + f1.height, l1.y + l1.height) - 1);
  expect(f1.height).toBeCloseTo(f0.height, 0);
  expect(l1.height).toBeCloseTo(l0.height, 0);
  await expect(panel).toHaveAttribute('data-for', 'field');
});

test('only one side panel is open at a time', async ({ page }) => {
  await page.locator('#project-field .project-toggle').click();
  await page.locator('#project-lms .project-toggle').click();
  await expect(page.locator('#project-lms-details')).toBeVisible();
  await expect(page.locator('#project-field-details')).toBeHidden();
  await expect(page.locator('#project-field .project-toggle')).toHaveAttribute('aria-expanded', 'false');
});

test('on phones a panel opens right below its own card', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  await page.locator('#project-field .project-toggle').click();
  const card = await page.locator('#project-field').boundingBox();
  const panel = await page.locator('#project-field-details').boundingBox();
  const lms = await page.locator('#project-lms').boundingBox();
  expect(panel.y).toBeGreaterThan(card.y + card.height - 1);
  expect(panel.y).toBeLessThan(lms.y);
});
