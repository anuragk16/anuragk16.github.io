const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'tests', 'docs', 'old_portfolio', 'scripts', '.git', '.superpowers', 'test-results', 'playwright-report']);
const SKIP_FILES = new Set(['package.json', 'package-lock.json', 'playwright.config.js']);
const EXT = /\.(html|css|js|svg)$/i;

/** All publicly served text files that make up the site. */
function servedFiles(dir = ROOT) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...servedFiles(path.join(dir, entry.name)));
    } else if (EXT.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const BANNED = /(?!)/; // word list kept private
const INTERNAL_NUMBERS = /(?!)/; // kept private

module.exports = { ROOT, servedFiles, BANNED, INTERNAL_NUMBERS };
