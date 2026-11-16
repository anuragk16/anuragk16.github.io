const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { servedFiles, BANNED, INTERNAL_NUMBERS } = require('./helpers');

test('content-guard: no banned client strings in served files', () => {
  test.skip(!!process.env.BASE_URL, 'file check runs locally only');
  for (const f of servedFiles()) expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(BANNED);
});

test('content-guard: no exact internal numbers', () => {
  test.skip(!!process.env.BASE_URL, 'file check runs locally only');
  for (const f of servedFiles()) expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(INTERNAL_NUMBERS);
});
