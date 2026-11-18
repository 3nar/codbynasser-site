// @ts-check
import { defineConfig } from 'astro/config';

const SITE_URL = process.env.SITE_URL ?? 'https://codbynasser.com';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  i18n: {
    locales: ['ar', 'en', 'ru'],
    defaultLocale: 'ar',
    routing: { prefixDefaultLocale: false },
  },
  compressHTML: false,
  markdown: { syntaxHighlight: false },
  vite: {
    build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) },
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "frame-src 'none'",
        "worker-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      styleDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
});
