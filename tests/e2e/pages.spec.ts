import { expect, test } from '@playwright/test';
import { LANGUAGES, PAGE_IDS, open, urlOf } from '../support/site';

// Every page, in every language, loads all its files and runs without a script error, on both screens.
// Anything the Content-Security-Policy refuses shows here too, as a console error.
for (const language of LANGUAGES) {
  for (const id of PAGE_IDS) {
    test(`${language}: ${id} loads cleanly`, async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`script: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
      // failed files are caught by open() itself
      await open(page, urlOf(id, '', language));
      expect(problems).toEqual([]);
      // the behaviour started and switched motion on (the motion is not reduced here)
      expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
