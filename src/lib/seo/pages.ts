import { soonSections } from '@/config/navigation';
import { routesFor, SERVICE_IDS, type ServiceId } from '@/config/routes';
import type { Key } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { PageKind } from './structured-data';

export interface SearchPage {
  path: string;
  kind: PageKind;
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
