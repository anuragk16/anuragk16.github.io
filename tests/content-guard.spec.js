const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const { ROOT } = require('./helpers');

// The banned list is private: it lives in .private/content-guard.json (git-ignored), never in the repo.
// Format: { "banned": "<regex source>", "numbers": "<regex source>" }
const LIST = path.join(ROOT, '.private', 'content-guard.json');

function loadGuard() {
  if (!fs.existsSync(LIST)) {
    throw new Error(`Content guard list missing: create ${LIST} (see README). Refusing to pass without it.`);
  }
  const cfg = JSON.parse(fs.readFileSync(LIST, 'utf8'));
  return { banned: new RegExp(cfg.banned, 'i'), numbers: new RegExp(cfg.numbers, 'i') };
}

const TEXT = /\.(html?|css|js|mjs|cjs|svg|json|md|txt|xml|yml|yaml|py|webmanifest)$/i;

/** Every tracked text file (plus new untracked ones), except the archived 2022 site. */
function publicTextFiles() {
  const out = execSync('git ls-files --cached --others --exclude-standard', { cwd: ROOT, encoding: 'utf8' });
  return out.split('\n').filter((f) => f && TEXT.test(f) && !f.startsWith('old_portfolio/')).map((f) => path.join(ROOT, f));
}

test('content-guard: no banned client strings in any public file', () => {
  test.skip(!!process.env.BASE_URL, 'file check runs locally only');
  const { banned } = loadGuard();
  for (const f of publicTextFiles()) expect(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f)).not.toMatch(banned);
});

test('content-guard: no exact internal numbers in any public file', () => {
  test.skip(!!process.env.BASE_URL, 'file check runs locally only');
  const { numbers } = loadGuard();
  for (const f of publicTextFiles()) expect(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f)).not.toMatch(numbers);
});

test('content-guard: live page', async ({ request }) => {
  test.skip(!process.env.BASE_URL, 'runs only against a deployed site (BASE_URL)');
  const { banned, numbers } = loadGuard();
  for (const p of ['/', '/css/tokens.css', '/css/base.css', '/css/components.css', '/css/motion.css', '/js/theme.js', '/js/interactions.js', '/js/motion.js']) {
    const body = await (await request.get(p)).text();
    expect(body, p).not.toMatch(banned);
    expect(body, p).not.toMatch(numbers);
  }
});
