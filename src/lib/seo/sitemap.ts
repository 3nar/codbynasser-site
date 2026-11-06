/**
 * sitemap.xml from the pages search engines may list: one <url> per page and language, each naming the same page in
 * every language and x-default (the default language), the way Google reads hreflang in a sitemap.
 * src/pages/sitemap.xml.ts serves it.
 */
const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

/** each page as its absolute address in every language, by language code */
export function sitemapXml(pages: Record<string, string>[], defaultLocale: string) {
  const urls = pages.flatMap((page) => {
    const alternates = [...Object.entries(page), ['x-default', page[defaultLocale]]]
      .map(([code, href]) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${escape(href)}"/>`)
      .join('\n');
    return Object.values(page).map((loc) => `  <url>\n    <loc>${escape(loc)}</loc>\n${alternates}\n  </url>`);
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
