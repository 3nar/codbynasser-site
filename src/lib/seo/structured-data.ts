/**
 * The site described for search engines and AI answer engines, as JSON-LD (schema.org): the brand cod by nasser,
 * Nasser himself, the site, and each page with its place in the site (breadcrumbs) and, on a service page, what
 * the service offers. Every value here is also on the page for the visitor to read: Google ignores, and may act
 * against, structured data that says what the page does not.
 */

export interface SiteFacts {
  /** the site's root, https://codbynasser.com/ */
  origin: string;
  /** the page's language: ar, en or ru */
  locale: string;
  /** every language the site has */
  locales: readonly string[];
  brand: string;
  /** the brand's other written forms (its handle) */
  alternateNames: string[];
  /** absolute address of a square raster logo, at least 112px */
  logo: { url: string; size: number };
  email: string;
  /** the brand's accounts elsewhere (Telegram, Instagram) */
  sameAs: string[];
  person: { name: string; jobTitle: string; url: string };
}

export type PageKind = 'home' | 'about' | 'contact' | 'collection' | 'page';

export interface PageFacts {
  kind: PageKind;
  /** the canonical address */
  url: string;
  title: string;
  description: string;
  /** from the home page to this one; the home page has only itself */
  breadcrumbs: { name: string; url: string }[];
  /** a service page: its name, summary, and the solutions it lists */
  service?: { name: string; description: string; offers: string[] };
}

const PAGE_TYPES: Record<PageKind, string> = {
  home: 'WebPage',
  about: 'AboutPage',
  contact: 'ContactPage',
  collection: 'CollectionPage',
  page: 'WebPage',
};

export function structuredData(site: SiteFacts, page: PageFacts) {
  const id = {
    website: `${site.origin}#website`,
    brand: `${site.origin}#brand`,
    person: `${site.origin}#nasser`,
    page: `${page.url}#webpage`,
    breadcrumb: `${page.url}#breadcrumb`,
    service: `${page.url}#service`,
  };
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': id.website,
      url: site.origin,
      name: site.brand,
      alternateName: site.alternateNames,
      inLanguage: site.locales,
      publisher: { '@id': id.brand },
    },
    {
      '@type': 'Organization',
      '@id': id.brand,
      name: site.brand,
      url: site.origin,
      logo: { '@type': 'ImageObject', url: site.logo.url, width: site.logo.size, height: site.logo.size },
      email: site.email,
      sameAs: site.sameAs,
      founder: { '@id': id.person },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: site.email,
        availableLanguage: site.locales,
      },
    },
    {
      '@type': 'Person',
      '@id': id.person,
      name: site.person.name,
      jobTitle: site.person.jobTitle,
      url: site.person.url,
      worksFor: { '@id': id.brand },
    },
  ];

  const webPage: Record<string, unknown> = {
    '@type': PAGE_TYPES[page.kind],
    '@id': id.page,
    url: page.url,
    name: page.title,
    description: page.description,
    inLanguage: site.locale,
    isPartOf: { '@id': id.website },
    about: { '@id': page.kind === 'about' ? id.person : id.brand },
  };
  if (page.kind === 'about') webPage.mainEntity = { '@id': id.person };
  if (page.service) webPage.mainEntity = { '@id': id.service };
  graph.push(webPage);

  // the home page is the first crumb itself: a trail starts on the pages below it
  if (page.breadcrumbs.length > 1) {
    webPage.breadcrumb = { '@id': id.breadcrumb };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': id.breadcrumb,
      itemListElement: page.breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  if (page.service) {
    graph.push({
      '@type': 'Service',
      '@id': id.service,
      name: page.service.name,
      serviceType: page.service.name,
      description: page.service.description,
      url: page.url,
      provider: { '@id': id.brand },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: page.service.name,
        itemListElement: page.service.offers.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
