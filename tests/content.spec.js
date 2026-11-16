const { test, expect } = require('@playwright/test');

const HEADLINE = 'I build software from zero and take it to real users.';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});

test('all sections present in order', async ({ page }) => {
  const ids = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['hero', 'proof', 'work', 'skills', 'journey', 'earlier', 'contact']);
});

test('hero copy and employer', async ({ page }) => {
  const h1 = page.locator('#hero h1.hero-title');
  expect((await h1.innerText()).replace(/\s+/g, ' ').trim()).toBe(HEADLINE);
  await expect(page.locator('#hero')).toContainText('Software Engineer');
  await expect(page.locator('#hero')).toContainText('ColoredCow');
});

test('three project cards with P/D/R', async ({ page }) => {
  const cards = page.locator('#work .project');
  await expect(cards).toHaveCount(3);
  for (const id of ['cert', 'field', 'lms']) {
    const details = page.locator(`#project-${id} .project-details`);
    const text = await details.textContent();
    for (const label of ['Problem', 'What I did', 'Result']) expect(text, id).toContain(label);
  }
});

test('cert card names Project Lead', async ({ page }) => {
  await expect(page.locator('#project-cert .project-sub')).toContainText('Project Lead');
});

test('six skills map to real projects', async ({ page }) => {
  const skills = page.locator('#skills .skill');
  await expect(skills).toHaveCount(6);
  const maps = await skills.evaluateAll((els) => els.map((e) => e.dataset.projects));
  for (const m of maps) for (const t of m.split(' ')) expect(['cert', 'field', 'lms']).toContain(t);
});

test('timeline dates', async ({ page }) => {
  const tl = page.locator('#journey .timeline');
  for (const s of ['30 May 2025', 'Jul 2025', 'Oct 2025', 'Project Lead']) await expect(tl).toContainText(s);
});

test('contact links', async ({ page }) => {
  const c = page.locator('#contact');
  await expect(c.locator('a[href="mailto:anuragkumawat1603@gmail.com"]')).toHaveCount(1);
  await expect(c.locator('a[href="https://www.linkedin.com/in/anurag-kumawat-71b84721b/"]')).toHaveCount(1);
  await expect(c.locator('a[href="https://github.com/anuragk16"]')).toHaveCount(1);
  await expect(c.locator('a[href="https://drive.google.com/file/d/1C3kgnHrbAAV-cBcfs7J2ZKeXa-0p1JHw/view?usp=drive_link"]')).toHaveCount(1);
});

test('no horizontal scroll at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(360);
});

test('old portfolio still reachable', async ({ request }) => {
  const res = await request.get('/old_portfolio/');
  expect(res.status()).toBe(200);
});
