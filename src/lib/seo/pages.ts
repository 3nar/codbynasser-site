/**
 * The pages search engines may list, in one language, and what each one is. One list decides it all: a listed page
 * gets its canonical address, its addresses in the other languages (hreflang), its structured data and its place
 * in sitemap.xml, and once SITE.searchable is on, robots "index". Any other page (the 404, a section still
 * «قريباً») says noindex and is left out.
 */
import { soonSections } from '@/config/navigation';
import { routesFor, SERVICE_IDS, type ServiceId } from '@/config/routes';
import type { Key } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { PageKind } from './structured-data';

export interface SearchPage {
  /** the address, as routesFor() writes it: /about/, /en/about/ */
  path: string;
  kind: PageKind;
  /** the page's short name, as the menus say it (a service page takes its service's name) */
  label?: Key;
  service?: ServiceId;
}

const isSoon = (section: string) => (soonSections as readonly string[]).includes(section);

export function searchPages(locale: Locale): SearchPage[] {
  const routes = routesFor(locale);
  return [
    { path: routes.home, kind: 'home', label: 'common.home' },
    ...SERVICE_IDS.map((service): SearchPage => ({ path: routes.service(service), kind: 'page', service })),
    { path: routes.request, kind: 'contact', label: 'common.requestService' },
    { path: routes.about, kind: 'about', label: 'nav.about' },
    { path: routes.join, kind: 'page', label: 'nav.links.join' },
    ...(isSoon('projects')
      ? []
      : [{ path: routes.projects, kind: 'collection', label: 'nav.soon.projects.label' } satisfies SearchPage]),
  ];
}
