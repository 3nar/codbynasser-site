export const LOCALES = {
  ar: { label: 'العربية', dir: 'rtl', intl: 'ar-IQ' },
  en: { label: 'English', dir: 'ltr', intl: 'en-US' },
  ru: { label: 'Русский', dir: 'ltr', intl: 'ru-RU' },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'ar';

export const LOCALE_ORDER: Locale[] = ['ar', 'en', 'ru'];

export const toLocale = (value: string | undefined): Locale =>
  value && value in LOCALES ? (value as Locale) : DEFAULT_LOCALE;
