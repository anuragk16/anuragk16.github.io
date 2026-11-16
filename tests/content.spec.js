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
  await expect(c.locator('a[href="resume/Anurag-Kumawat-Resume.pdf"]')).toHaveCount(1);
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

test('no link to the 2022 portfolio', async ({ page }) => {
  await expect(page.locator('a[href^="old_portfolio"]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('2022 portfolio');
});

test('every Resume link opens the PDF on this site', async ({ page, request }) => {
  const hrefs = await page.locator('a', { hasText: 'Resume' }).evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThanOrEqual(2);
  for (const h of hrefs) expect(h).toBe('resume/Anurag-Kumawat-Resume.pdf');
  const res = await request.get('/resume/Anurag-Kumawat-Resume.pdf');
  expect(res.status()).toBe(200);
  expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('work intro is a single clean line', async ({ page }) => {
  await expect(page.locator('#work .section-intro')).toHaveText('Real systems, built from scratch and used every day.');
});
