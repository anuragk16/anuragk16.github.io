const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
});

test('skill highlights its projects', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover covered by focus test on touch');
  await page.locator('.skill[data-projects="field lms"]').hover();
  await expect(page.locator('#project-field')).toHaveClass(/is-linked/);
  await expect(page.locator('#project-lms')).toHaveClass(/is-linked/);
  await expect(page.locator('#project-cert')).not.toHaveClass(/is-linked/);
  await expect(page.locator('.skill[data-projects="field lms"]')).toHaveClass(/is-active/);
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

  await page.locator('#project-cert .project-open').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#case-study')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study')).toBeHidden();

  await page.locator('.skill[data-projects="field lms"]').focus();
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
  await expect(page.locator('.skill[data-projects="field lms"] .skill-used')).toContainText('Health-worker training platform');
});

test('clicking a skill scrolls to the work that proves it', async ({ page }) => {
  await page.locator('.skill[data-projects="field lms"]').click();
  const card = page.locator('#project-field');
  await expect(card).toHaveClass(/is-linked/);
  await expect(card).toBeInViewport();
});

test('side cards share a row on desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'cards stack on phones');
  const f = await page.locator('#project-field').boundingBox();
  const l = await page.locator('#project-lms').boundingBox();
  expect(Math.abs(f.y - l.y)).toBeLessThan(1);
  expect(l.x).toBeGreaterThan(f.x + f.width);
});

test('cards show a teaser and never change size', async ({ page }) => {
  const sizes = async () => page.locator('#work .project').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  await page.evaluate(() => document.fonts.ready);
  const before = await sizes();
  for (const id of ['cert', 'field', 'lms']) {
    await expect(page.locator(`#project-${id} .project-teaser`)).toBeVisible();
    await expect(page.locator(`#project-${id}-details`)).toBeHidden();
    await page.locator(`#project-${id} .project-open`).click();
    await expect(page.locator('#case-study')).toBeVisible();
    await page.locator('#case-study .case-close').click();
    await expect(page.locator('#case-study')).toBeHidden();
  }
  const after = await sizes();
  after.forEach((h, i) => expect(Math.abs(h - before[i])).toBeLessThanOrEqual(1));
});

test('case study shows the right project story', async ({ page }) => {
  await page.locator('#project-lms .project-open').click();
  const dlg = page.locator('#case-study');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('#case-study-title')).toHaveText('Health-worker training platform');
  for (const label of ['Problem', 'What I did', 'Result']) await expect(dlg).toContainText(label);
  await expect(dlg).toContainText('open-source LMS built on Frappe');
  expect(await dlg.evaluate((d) => d.open && d.matches(':modal'))).toBe(true);
});

test('case study closes with the cross, Escape and the blurred area', async ({ page }) => {
  const dlg = page.locator('#case-study');
  const open = () => page.locator('#project-field .project-open').click();

  await open(); await expect(dlg).toBeVisible();
  await page.locator('#case-study .case-close').click();
  await expect(dlg).toBeHidden();

  await open(); await expect(dlg).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();

  await open(); await expect(dlg).toBeVisible();
  const vp = page.viewportSize();
  await page.mouse.click(4, vp.height - 4); // the blurred backdrop, outside the case study
  await expect(dlg).toBeHidden();
});

test('clicking inside the case study does not close it', async ({ page }) => {
  await page.locator('#project-field .project-open').click();
  await page.locator('#case-study-title').click();
  await expect(page.locator('#case-study')).toBeVisible();
});

test('focus returns to the card button after closing', async ({ page }) => {
  const btn = page.locator('#project-field .project-open');
  await btn.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study')).toBeHidden();
  await expect(btn).toBeFocused();
});

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('case study grows out of its card and shrinks back into it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const card = page.locator('#project-field');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const cardBox = await card.boundingBox();
    // first frame of opening: the case study sits over the card
    const first = await page.evaluate(() => new Promise((res) => {
      document.querySelector('#project-field .project-open').click();
      requestAnimationFrame(() => requestAnimationFrame(() => { const r = document.getElementById('case-study').getBoundingClientRect(); res({ x: r.x, y: r.y, w: r.width, h: r.height }); }));
    }));
    const cx = first.x + first.w / 2, cy = first.y + first.h / 2;
    expect(Math.abs(cx - (cardBox.x + cardBox.width / 2))).toBeLessThan(cardBox.width * 0.25);
    expect(Math.abs(cy - (cardBox.y + cardBox.height / 2))).toBeLessThan(cardBox.height * 0.6);
    await page.waitForTimeout(700);
    const full = await page.locator('#case-study').boundingBox();
    expect(full.width * full.height).toBeGreaterThan(first.w * first.h * 1.05);
    // closing animates back over the card before the dialog closes
    const closing = await page.evaluate(() => new Promise((res) => {
      document.querySelector('#case-study .case-close').click();
      setTimeout(() => { const d = document.getElementById('case-study'); const r = d.getBoundingClientRect(); res({ open: d.open, w: r.width, h: r.height }); }, 300);
    }));
    expect(closing.open).toBe(true);
    expect(closing.w * closing.h).toBeLessThan(full.width * full.height);
    await expect(page.locator('#case-study')).toBeHidden();
  });
});
