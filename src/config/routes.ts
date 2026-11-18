import { DEFAULT_LOCALE, LOCALE_ORDER, toLocale, type Locale } from '@/i18n/config';

export const SERVICE_IDS = ['ai', 'software', 'accounts'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string) => `${BASE}${path}`;

export const localeBase = (locale?: string) => {
  const code = toLocale(locale);
  return BASE + (code === DEFAULT_LOCALE ? '' : `/${code}`);
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

export const localePaths = () =>
  LOCALE_ORDER.map((code) => ({
    params: { locale: code === DEFAULT_LOCALE ? undefined : code },
  }));

export function pathIn(locale: Locale, pathname: string, from?: string) {
  const current = localeBase(from);
  const rest = current && pathname.startsWith(`${current}/`) ? pathname.slice(current.length) : pathname;
  const page = /(^|\/)404(\.html|\/)?$/.test(rest) ? '/' : rest;
  return `${localeBase(locale)}${page}`;
}
