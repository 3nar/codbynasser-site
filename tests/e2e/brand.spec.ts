import { expect, test } from '@playwright/test';
import { LANGUAGES, open, urlOf } from '../support/site';

// Every language carries the same brand: the wordmark, the name in the title, the story, the icons and its share image.
for (const language of LANGUAGES) {
  test(`${language}: the brand is on the page`, async ({ page, request }) => {
    await open(page, urlOf('about', '', language));
    await expect(page).toHaveTitle(/\| cod by nasser$/);
    await expect(page.locator('.nav-bar .brand svg')).toBeVisible();
    await expect(page.locator('footer .foot-name')).toContainText('by nasser');
    const title = page.locator('#manifesto-title');
    await title.scrollIntoViewIfNeeded();
    await expect(title).toBeVisible();
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      new RegExp(`/og/${language}\\.jpg$`),
    );
    for (const file of [
      '/favicon.svg',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/site.webmanifest',
      `/og/${language}.jpg`,
    ]) {
      expect((await request.get(file)).ok(), file).toBe(true);
    }
  });
}
