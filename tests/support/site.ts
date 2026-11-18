import type { Page } from '@playwright/test';

export type PageId = 'home' | 'accounts' | 'ai' | 'software' | 'request' | 'projects' | 'about' | 'join' | 'not-found';

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

export const LANGUAGES = ['ar', 'en', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];

export function urlOf(id: PageId, query = '', language: Language = 'ar') {
  if (language === 'ar') return PAGES[id] + query;
  return (id === 'not-found' ? `/${language}/404/` : `/${language}${PAGES[id]}`) + query;
}

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
