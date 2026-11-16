const { test, expect } = require('@playwright/test');

test('home loads with title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Anurag Kumawat — Software Engineer');
});
