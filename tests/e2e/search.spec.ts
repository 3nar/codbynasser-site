import { expect, test, type Page } from '@playwright/test';
import { SITE } from '../../src/config/site';
import { LANGUAGES, PAGE_IDS, urlOf } from '../support/site';

/**
 * What search engines read on every page, in every language: a title and description that fit
 * the result, unique within the language; and on the pages sitemap.xml lists, a canonical address, the page in
 * the other languages, and structured data that parses. The other pages (the 404, sections still «قريباً») say
 * noindex and carry none of it. Before launch (SITE.searchable off) every page says noindex.
 */
const LIMITS = { title: 60, description: 158, shortest: 100 };

async function sitemap(page: Page) {
  const xml = await (await page.request.get('/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

async function head(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
      l.getAttribute('hreflang'),
      new URL(l.getAttribute('href')!).pathname,
    ]),
    data: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
  }));
}

test('sitemap.xml lists every page but the 404, in every language @desktop', async ({ page }) => {
  const listed = await sitemap(page);
  expect(new Set(listed).size).toBe(listed.length);
  expect(listed).toContain('/');
  expect(listed).toContain('/en/services/ai/');
  expect(listed.filter((path) => path.includes('404'))).toEqual([]);
  for (const path of listed) expect((await page.request.get(path)).status()).toBe(200);
});

for (const language of LANGUAGES) {
  test(`${language}: every page reads well in a search result @desktop`, async ({ page }) => {
    const listed = await sitemap(page);
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const id of PAGE_IDS) {
      const url = urlOf(id, '', language);
      const h = await head(page, url);
      const where = `${url}:`;
      expect(h.title.length, `${where} title «${h.title}»`).toBeLessThanOrEqual(LIMITS.title);
      expect(h.description.length, `${where} description`).toBeLessThanOrEqual(LIMITS.description);
      expect(titles.has(h.title), `${where} title used twice`).toBe(false);
      titles.add(h.title);

      if (!listed.includes(new URL(url, 'http://x').pathname)) {
        expect(h.robots, where).toBe('noindex');
        expect(h.canonical, where).toBeNull();
        expect(h.data, where).toEqual([]);
        continue;
      }
      expect(h.description.length, `${where} description`).toBeGreaterThanOrEqual(LIMITS.shortest);
      expect(descriptions.has(h.description), `${where} description used twice`).toBe(false);
      descriptions.add(h.description);
      expect(h.robots, where).toBe(SITE.searchable ? 'index, follow, max-image-preview:large' : 'noindex');
      expect(new URL(h.canonical!).pathname, where).toBe(new URL(url, 'http://x').pathname);
      expect(
        h.alternates.map(([code]) => code),
        where,
      ).toEqual([...LANGUAGES, 'x-default']);
      expect(h.alternates.find(([code]) => code === language)?.[1], where).toBe(new URL(h.canonical!).pathname);

      expect(h.data, where).toHaveLength(1);
      const graph = (JSON.parse(h.data[0]) as { '@graph': { '@type': string }[] })['@graph'];
      const types = graph.map((n) => n['@type']);
      expect(types, where).toEqual(expect.arrayContaining(['WebSite', 'Organization', 'Person']));
      if (id !== 'home') expect(types, where).toContain('BreadcrumbList');
      if (['accounts', 'ai', 'software'].includes(id)) expect(types, where).toContain('Service');
    }
  });
}
