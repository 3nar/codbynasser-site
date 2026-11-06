/**
 * Interface texts. src/i18n/ui/<locale>/<namespace>.json holds them; the Arabic files are the reference that
 * types every key, so a misspelt key fails `npm run check`, and a key missing in Arabic fails the build.
 *
 *   const t = useTranslations(Astro.currentLocale);
 *   t('home.hero.lede')                     → string
 *   t('home.network.steps')                 → { title, text }[]
 *   t('service.next', { name: 'الذكاء' })   → «التالي: الذكاء»
 */
import { DEFAULT_LOCALE, toLocale, type Locale } from './config';
import { fill } from './format';
import type about from './ui/ar/about.json';
import type common from './ui/ar/common.json';
import type footer from './ui/ar/footer.json';
import type forms from './ui/ar/forms.json';
import type home from './ui/ar/home.json';
import type join from './ui/ar/join.json';
import type nav from './ui/ar/nav.json';
import type notFound from './ui/ar/notFound.json';
import type projects from './ui/ar/projects.json';
import type request from './ui/ar/request.json';
import type screens from './ui/ar/screens.json';
import type service from './ui/ar/service.json';

export interface Messages {
  about: typeof about;
  common: typeof common;
  footer: typeof footer;
  forms: typeof forms;
  home: typeof home;
  join: typeof join;
  nav: typeof nav;
  notFound: typeof notFound;
  projects: typeof projects;
  request: typeof request;
  screens: typeof screens;
  service: typeof service;
}

/** every dotted path into the messages, to a text, a list or a group */
export type Key<T = Messages> = {
  [K in keyof T & string]: T[K] extends string | readonly unknown[]
    ? K
    : T[K] extends object
      ? K | `${K}.${Key<T[K]>}`
      : K;
}[keyof T & string];

/** the value a key leads to */
export type Value<P extends string, T = Messages> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? Value<Rest, T[Head]>
    : never
  : P extends keyof T
    ? T[P]
    : never;

const files = import.meta.glob<Record<string, unknown>>('./ui/*/*.json', { eager: true, import: 'default' });
const dictionaries: Partial<Record<Locale, Record<string, unknown>>> = {};
for (const [path, data] of Object.entries(files)) {
  const [, locale, namespace] = path.match(/\.\/ui\/([^/]+)\/([^/]+)\.json$/) ?? [];
  if (!locale || !namespace) continue;
  (dictionaries[locale as Locale] ??= {})[namespace] = data;
}

const lookup = (dict: unknown, key: string) =>
  key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict);

export function useTranslations(locale?: string) {
  const current = toLocale(locale);
  return function t<K extends Key>(key: K, vars?: Record<string, string | number>): Value<K> {
    let value = lookup(dictionaries[current], key);
    if (value === undefined && current !== DEFAULT_LOCALE) value = lookup(dictionaries[DEFAULT_LOCALE], key);
    if (value === undefined) throw new Error(`Missing interface text: ${key}`);
    return (typeof value === 'string' && vars ? fill(value, vars) : value) as Value<K>;
  };
}
