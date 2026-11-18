import { describe, expect, it } from 'vitest';
import { sitemapXml } from '@/lib/seo/sitemap';
import { structuredData, type PageFacts, type SiteFacts } from '@/lib/seo/structured-data';

const site: SiteFacts = {
  origin: 'https://example.com/',
  locale: 'en',
  locales: ['ar', 'en', 'ru'],
  brand: 'cod by nasser',
  alternateNames: ['codbynasser'],
  logo: { url: 'https://example.com/icon-512.png', size: 512 },
  email: 'a@example.com',
  sameAs: ['https://t.me/x'],
  person: { name: 'Nasser', jobTitle: 'AI engineer', url: 'https://example.com/en/about/' },
};
const home = { name: 'Home', url: 'https://example.com/en/' };
const page = (facts: Partial<PageFacts>): PageFacts => ({
  kind: 'page',
  url: 'https://example.com/en/x/',
  title: 'X | cod by nasser',
  description: 'About X.',
  breadcrumbs: [home, { name: 'X', url: 'https://example.com/en/x/' }],
  ...facts,
});
const types = (data: ReturnType<typeof structuredData>) => data['@graph'].map((node) => node['@type']);
const node = (data: ReturnType<typeof structuredData>, type: string) =>
  data['@graph'].find((n) => n['@type'] === type) as Record<string, unknown>;

describe('structuredData', () => {
  it('names the site, the brand and Nasser on every page, tied by their ids', () => {
    const data = structuredData(site, page({}));
    expect(types(data)).toEqual(expect.arrayContaining(['WebSite', 'Organization', 'Person', 'WebPage']));
    expect(node(data, 'WebSite')).toMatchObject({ name: 'cod by nasser', alternateName: ['codbynasser'] });
    expect(node(data, 'WebSite').publisher).toEqual({ '@id': node(data, 'Organization')['@id'] });
    expect(node(data, 'Organization').founder).toEqual({ '@id': node(data, 'Person')['@id'] });
  });

  it('gives the home page no breadcrumb trail, and the pages below it one', () => {
    expect(types(structuredData(site, page({ kind: 'home', breadcrumbs: [home] })))).not.toContain('BreadcrumbList');
    const trail = node(structuredData(site, page({})), 'BreadcrumbList').itemListElement as Record<string, unknown>[];
    expect(trail.map((c) => [c.position, c.name])).toEqual([
      [1, 'Home'],
      [2, 'X'],
    ]);
  });

  it('makes the about page about Nasser', () => {
    const data = structuredData(site, page({ kind: 'about' }));
    expect(node(data, 'AboutPage').mainEntity).toEqual({ '@id': node(data, 'Person')['@id'] });
  });

  it('lists a service page’s solutions, without prices it never states', () => {
    const data = structuredData(site, page({ service: { name: 'AI', description: 'Data.', offers: ['A', 'B'] } }));
    const service = node(data, 'Service');
    expect(service.provider).toEqual({ '@id': node(data, 'Organization')['@id'] });
    const offers = (service.hasOfferCatalog as { itemListElement: Record<string, unknown>[] }).itemListElement;
    expect(offers.map((o) => (o.itemOffered as { name: string }).name)).toEqual(['A', 'B']);
    expect(JSON.stringify(service)).not.toContain('price');
  });
});

describe('sitemapXml', () => {
  const xml = sitemapXml(
    [
      { ar: 'https://example.com/', en: 'https://example.com/en/' },
      { ar: 'https://example.com/a/?x=1&y=2', en: 'https://example.com/en/a/' },
    ],
    'ar',
  );

  it('lists every page in every language', () => {
    expect([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).toEqual([
      'https://example.com/',
      'https://example.com/en/',
      'https://example.com/a/?x=1&amp;y=2',
      'https://example.com/en/a/',
    ]);
  });

  it('names the same page in each language, and x-default as the default language', () => {
    const first = xml.split('</url>')[1];
    expect(first).toContain('hreflang="ar" href="https://example.com/"');
    expect(first).toContain('hreflang="en" href="https://example.com/en/"');
    expect(first).toContain('hreflang="x-default" href="https://example.com/"');
  });
});
