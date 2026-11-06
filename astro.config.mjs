// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://codbynasser.com',
  // Arabic at the root, English and Russian under /en/ and /ru/; Astro.currentLocale follows the address
  i18n: {
    locales: ['ar', 'en', 'ru'],
    defaultLocale: 'ar',
    routing: { prefixDefaultLocale: false },
  },
  // the markup relies on the spaces between inline elements (links, buttons, spans); compressing the HTML
  // would remove some of them and move the layout
  compressHTML: false,
  // no page renders Markdown code, and Shiki's inline styles would not pass the Content-Security-Policy below
  markdown: { syntaxHighlight: false },
  vite: {
    // fonts stay files, never data: addresses inside the CSS, which font-src 'self' would refuse
    build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) },
  },
  // Content-Security-Policy as a <meta> in every page: only this site's own scripts, styles, fonts and images,
  // each inline script and <style> allowed by its hash. Inline style="" attributes stay allowed (style-src-attr):
  // the markup sets a few custom properties that way. What a <meta> cannot carry (frame-ancestors) is in
  // public/_headers. tests/e2e/security.spec.ts fails on any violation.
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
