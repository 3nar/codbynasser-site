/**
 * Every address in the site, built in one place. Arabic lives at the root (/about/), the other languages under
 * their code (/en/about/, /ru/about/); the pages are src/pages/[...locale]/, one file for every language.
 *
 *   const routes = routesFor(Astro.currentLocale);
 *   routes.about                              → /en/about/
 *   routes.requestFor({ service: 'ai' })      → /en/request/?s=ai
 */
import { DEFAULT_LOCALE, LOCALE_ORDER, toLocale, type Locale } from '@/i18n/config';

/** the three services, in the order the menus show them */
export const SERVICE_IDS = ['ai', 'software', 'accounts'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/** the start of every address in a language: '' for Arabic, '/en' for English */
export const localeBase = (locale?: string) => {
  const code = toLocale(locale);
  return code === DEFAULT_LOCALE ? '' : `/${code}`;
};

export function routesFor(locale?: string) {
  const base = localeBase(locale);
  const request = `${base}/request/`;
  return {
    home: `${base}/`,
    service: (id: ServiceId) => `${base}/services/${id}/`,
    request,
    projects: `${base}/projects/`,
    about: `${base}/about/`,
    join: `${base}/join/`,
    /**
     * The request form, with what the visitor chose already filled in:
     * a service (?s=ai), a problem in it (&p=2), «not sure» (?s=unsure), or a similar project (?project=tutubot).
     */
    requestFor(choice: { service?: ServiceId | 'unsure'; problem?: number; project?: string } = {}) {
      const query = new URLSearchParams();
      if (choice.service) query.set('s', choice.service);
      if (choice.problem) query.set('p', String(choice.problem));
      if (choice.project) query.set('project', choice.project);
      const qs = query.toString();
      return qs ? `${request}?${qs}` : request;
    },
  };
}

export type Routes = ReturnType<typeof routesFor>;

/** getStaticPaths for a page that exists in every language: Arabic at the root, the others under their code */
export const localePaths = () =>
  LOCALE_ORDER.map((code) => ({
    params: { locale: code === DEFAULT_LOCALE ? undefined : code },
  }));

/**
 * The same page in another language: /en/about/ → /ru/about/. A page that has no address of its own (the 404)
 * leads to the other language's home.
 */
export function pathIn(locale: Locale, pathname: string, from?: string) {
  const current = localeBase(from);
  const rest = current && pathname.startsWith(`${current}/`) ? pathname.slice(current.length) : pathname;
  const page = /(^|\/)404(\.html|\/)?$/.test(rest) ? '/' : rest;
  return `${localeBase(locale)}${page}`;
}
