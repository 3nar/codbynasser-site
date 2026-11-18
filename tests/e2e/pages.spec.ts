import { expect, test } from '@playwright/test';
import { LANGUAGES, PAGE_IDS, open, urlOf } from '../support/site';

for (const language of LANGUAGES) {
  for (const id of PAGE_IDS) {
    test(`${language}: ${id} loads cleanly`, async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`script: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
      await open(page, urlOf(id, '', language));
      expect(problems).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
