import type { Page } from '@playwright/test';

export type PageId = 'home' | 'accounts' | 'ai' | 'software' | 'request' | 'projects' | 'about' | 'join' | 'not-found';

/** Every page of the site, at its route. */
export const PAGES: Record<PageId, string> = {
  home: '/',
  accounts: '/services/accounts/',
  ai: '/services/ai/',
  software: '/services/software/',
  request: '/request/',
  projects: '/projects/',
  about: '/about/',
  join: '/join/',
  'not-found': '/404.html',
};

export const PAGE_IDS = Object.keys(PAGES) as PageId[];

/** the site's languages: Arabic at the root, the others under their code */
export const LANGUAGES = ['ar', 'en', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];

/** a page's address in a language; the 404 of English and Russian is /en/404/ and /ru/404/ */
export function urlOf(id: PageId, query = '', language: Language = 'ar') {
  if (language === 'ar') return PAGES[id] + query;
  return (id === 'not-found' ? `/${language}/404/` : `/${language}${PAGES[id]}`) + query;
}

/**
 * Load a page and wait until fonts, images and the first canvas frames are in. Everything comes from the site
 * itself, fonts included (styles/fonts.css). A file that fails to load fails the test at once.
 */
export async function open(page: Page, url: string) {
  const failed: string[] = [];
  page.on('requestfailed', (r) => failed.push(`${r.url()} (${r.failure()?.errorText})`));
  page.on(
    'response',
    (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && failed.push(`${r.url()} (${r.status()})`),
  );
  await page.goto(url, { waitUntil: 'networkidle' });
  if (failed.length) throw new Error(`files did not load: ${failed.join(', ')}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}
