/**
 * The site's languages. Arabic is the default and the source of every text, at the root (/about/); English and
 * Russian live under their code (/en/about/, /ru/about/), read left to right, and mirror the Arabic layout.
 * To add one: copy src/i18n/ui/ar and every src/content/<collection>/ar, translate the values (never the keys),
 * add it here, to LOCALE_ORDER and to `i18n.locales` in astro.config.mjs, then run npm run i18n:check.
 * `intl` is the tag numbers are written with (ar-IQ writes ٩٦ and ١٬٠٠٠٬٠٠٠).
 */
export const LOCALES = {
  ar: { label: 'العربية', dir: 'rtl', intl: 'ar-IQ' },
  en: { label: 'English', dir: 'ltr', intl: 'en-US' },
  ru: { label: 'Русский', dir: 'ltr', intl: 'ru-RU' },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'ar';

/** the order languages appear in the language menus */
export const LOCALE_ORDER: Locale[] = ['ar', 'en', 'ru'];

/** Astro.currentLocale is undefined until i18n routing is configured; every page is Arabic until then. */
export const toLocale = (value: string | undefined): Locale =>
  value && value in LOCALES ? (value as Locale) : DEFAULT_LOCALE;
