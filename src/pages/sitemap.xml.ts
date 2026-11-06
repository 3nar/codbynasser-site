/** /sitemap.xml: the pages search engines may list (lib/seo/pages.ts), in every language, with their hreflang links. */
import type { APIRoute } from 'astro';
import { DEFAULT_LOCALE, LOCALE_ORDER } from '@/i18n/config';
import { searchPages } from '@/lib/seo/pages';
import { sitemapXml } from '@/lib/seo/sitemap';

export const GET: APIRoute = ({ site }) => {
  const byLocale = LOCALE_ORDER.map((locale) => [locale, searchPages(locale)] as const);
  // the lists run in the same order in every language: the i-th page of each is the same page
  const pages = byLocale[0][1].map((_, i) =>
    Object.fromEntries(byLocale.map(([locale, list]) => [locale, new URL(list[i].path, site).href])),
  );
  return new Response(sitemapXml(pages, DEFAULT_LOCALE), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
