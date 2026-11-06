import { expect, test } from '@playwright/test';
import { LANGUAGES, PAGE_IDS, open, urlOf, type Language } from '../support/site';

/**
 * The Content-Security-Policy on every page, in every language (security.csp in astro.config.mjs): it is there and
 * strict, the page asks for nothing it refuses, nothing comes from another site, and the fonts, served from this
 * site, are in use. public/_headers is checked by tests/unit/security-headers.test.ts: astro preview ignores it.
 */
const FAMILIES: Record<Language, string[]> = {
  ar: ['Tajawal', 'IBM Plex Sans Arabic'],
  en: ['Onest'],
  ru: ['Onest'],
};

for (const language of LANGUAGES) {
  for (const id of PAGE_IDS) {
    test(`${language}: ${id} keeps to its security policy`, async ({ page, baseURL }) => {
      await page.addInitScript(() => {
        const refused: string[] = [];
        Object.assign(window, { refused });
        document.addEventListener('securitypolicyviolation', (e) =>
          refused.push(`${e.effectiveDirective} refused ${e.blockedURI || 'inline'}`),
        );
      });
      const elsewhere: string[] = [];
      page.on('request', (r) => {
        const url = new URL(r.url());
        if (url.protocol.startsWith('http') && url.origin !== new URL(baseURL!).origin) elsewhere.push(r.url());
      });
      await open(page, urlOf(id, '', language));
      // down the whole page, so every scene and lazy image on the way runs
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((done) => setTimeout(done, 60));
        }
      });
      await page.waitForTimeout(400);

      const policy = await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content');
      expect(policy).toContain("default-src 'self'");
      expect(policy).toMatch(/script-src 'self'( 'sha\d+-[^']+')*;/);
      expect(policy).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);

      expect(await page.evaluate(() => (window as unknown as { refused: string[] }).refused)).toEqual([]);
      expect(elsewhere).toEqual([]);
      const loaded = await page.evaluate(() =>
        [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')),
      );
      for (const family of FAMILIES[language]) expect(loaded).toContain(family);
    });
  }
}

// what a cross-site scripting attack would slip into a page: a script of its own, and a handler on an element
test('a script slipped into the page does not run @desktop', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai'));
  const result = await page.evaluate(async () => {
    const refused: string[] = [];
    document.addEventListener('securitypolicyviolation', (e) => refused.push(e.effectiveDirective));
    const script = document.createElement('script');
    script.textContent = 'window.slipped = true';
    document.body.append(script);
    const box = document.createElement('div');
    box.innerHTML = '<img src="data:," onerror="window.handled = true">';
    document.body.append(box);
    await new Promise((done) => setTimeout(done, 800));
    return { slipped: 'slipped' in window, handled: 'handled' in window, refused: refused.sort() };
  });
  expect(result).toEqual({ slipped: false, handled: false, refused: ['script-src-attr', 'script-src-elem'] });
});
