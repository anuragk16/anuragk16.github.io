const { test, expect } = require('@playwright/test');

const HEADLINE = 'I build software from zero and take it to real users.';

test.describe('with motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('reveal adds is-in when scrolled into view', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#project-lms');
    await expect(card).not.toHaveClass(/is-in/);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-in/);
  });

  test('count-up animates to target', async ({ page }) => {
    await page.addInitScript(() => {
      window.__seen = [];
      new MutationObserver(() => {
        const n = document.querySelector('.proof-num');
        if (n) window.__seen.push(n.textContent);
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.getElementById('proof').offsetTop - 200));
    await expect(page.locator('.proof-num').first()).toHaveText('3', { timeout: 3000 });
    await expect(page.locator('.proof-num').nth(2)).toHaveText('455', { timeout: 3000 });
    const seen = await page.evaluate(() => window.__seen);
    expect(seen.some((v) => v === '0' || v === '1' || v === '2')).toBe(true);
  });

  test('scroll progress grows', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(async () => page.locator('#scroll-progress').evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return m.a;
    })).toBeGreaterThan(0.95);
  });

  test('timeline steps turn on', async ({ page }) => {
    await page.goto('/');
    await page.locator('#earlier').scrollIntoViewIfNeeded();
    await expect(page.locator('.timeline-step.is-on')).toHaveCount(await page.locator('.timeline-step').count());
  });

  test('headline text unchanged after split', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('.hero-title');
    await expect(h1.locator('.word')).toHaveCount(HEADLINE.split(' ').length);
    expect((await h1.innerText()).replace(/\s+/g, ' ').trim()).toBe(HEADLINE);
    await expect(h1).toHaveAttribute('aria-label', HEADLINE);
  });

  test('timeline steps not yet reached stay readable', async ({ page }) => {
    await page.goto('/');
    const last = page.locator('.timeline-step').last();
    await expect(last).not.toHaveClass(/is-on/);
    await expect(last).toHaveCSS('opacity', '1');
    await expect(last.locator('h3')).toHaveCSS('opacity', '1');
  });

  test('logo draws itself', async ({ page }) => {
    await page.goto('/');
    const name = await page.locator('.site-nav .logo-a').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).not.toBe('none');
  });
});

test('reduced motion shows all content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const clips = await page.locator('.reveal').evaluateAll((els) => els.map((e) => getComputedStyle(e).clipPath));
  for (const c of clips) expect(c).not.toContain('0px 0px, 0px 0px');
  await expect(page.locator('.proof-num')).toHaveText(['3', '11', '455']);
  const anim = await page.locator('.site-nav .logo-a').evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
  await expect(page.locator('.timeline-step').first()).toHaveCSS('opacity', '1');
});

test('no-js shows all content', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#project-cert-details')).toBeVisible();
  const clip = await page.locator('#project-lms').evaluate((e) => getComputedStyle(e).clipPath);
  expect(clip).not.toContain('0px 0px, 0px 0px');
  expect(await page.locator('#earlier-list .mini:visible').count()).toBe(await page.locator('#earlier-list .mini').count());
  await ctx.close();
});

test('cards stay visible if motion.js fails to load', async ({ page }) => {
  await page.route('**/js/motion.js', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('#project-lms').scrollIntoViewIfNeeded();
  const clip = await page.locator('#project-lms').evaluate((e) => getComputedStyle(e).clipPath);
  expect(clip).not.toContain('0px 0px, 0px 0px');
});

test('print shows cards and timeline dates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.emulateMedia({ media: 'print', reducedMotion: 'no-preference' });
  const clip = await page.locator('#project-lms').evaluate((e) => getComputedStyle(e).clipPath);
  expect(clip).not.toContain('0px 0px, 0px 0px');
  await expect(page.locator('.timeline-when').last()).toHaveCSS('opacity', '1');
});
