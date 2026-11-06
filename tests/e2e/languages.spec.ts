import { expect, test } from '@playwright/test';
import { open, urlOf } from '../support/site';

// Arabic reads right to left at the root; English and Russian read left to right under their code.
const LANGUAGES = [
  { code: 'ar', dir: 'rtl', button: 'اطلب خدمة' },
  { code: 'en', dir: 'ltr', button: 'Request a service' },
  { code: 'ru', dir: 'ltr', button: 'Заказать услугу' },
] as const;

for (const { code, dir, button } of LANGUAGES) {
  test(`${code}: the page speaks its language, in its direction`, async ({ page }) => {
    await open(page, urlOf('about', '', code));
    await expect(page.locator('html')).toHaveAttribute('lang', code);
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.locator('#dock .pill, .nav-bar .pill').first()).toHaveText(button);
    // search engines learn the same page's address in every language
    for (const other of LANGUAGES) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${other.code}"]`)).toHaveAttribute(
        'href',
        new RegExp(`${urlOf('about', '', other.code)}$`),
      );
    }
  });
}

test('the language menu leads to the same page in another language, with what was chosen', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai&p=1', 'en'));
  await expect(page.locator('#ctxText')).toHaveText(
    'This caught my eye: You have numbers, and don’t know what they mean?',
  );
  const russian = page.locator('a.lang[hreflang="ru"]').first();
  await expect(russian).toHaveAttribute('href', /\/ru\/request\/\?s=ai&p=1$/);
  await page.goto(String(await russian.getAttribute('href')));
  await expect(page).toHaveURL(/\/ru\/request\/\?s=ai&p=1$/);
  await expect(page.locator('#ctxText')).toHaveText(
    'Меня заинтересовало: У вас есть цифры, но непонятно, что они значат?',
  );
  await expect(page.locator('[name="service"][value="ai"]')).toBeChecked();
});

test('the request message is written in the language of the page', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai&p=1', 'en'));
  await page.locator('[name="name"]').fill('Sara');
  const bubble = page.locator('#bubble');
  await expect(bubble).toContainText('Hi Nasser, I’m Sara.');
  await expect(bubble).toContainText('Service: AI and data');
  await expect(bubble).toContainText('This caught my eye: You have numbers, and don’t know what they mean?');
  await expect(page.locator('#sendMain')).toHaveText('Send via WhatsApp');
  await open(page, urlOf('join', '', 'ru'));
  await page.locator('[name="name"]').fill('Анна');
  await expect(page.locator('#bubble')).toContainText(
    'Здравствуйте, Насер! Меня зовут Анна, и я хочу с вами работать.',
  );
});

test('the phone menu lists the languages as links', { tag: '@phone' }, async ({ page }) => {
  await open(page, urlOf('home', '', 'ru'));
  await page.locator('#menuToggle').click();
  await expect(page.locator('#menuToggle')).toHaveAttribute('aria-label', 'Закрыть меню');
  const row = page.locator('.sheet .langs-row');
  await expect(row.locator('[aria-current="true"]')).toHaveText('Русский');
  await expect(row.locator('a[hreflang="ar"]')).toHaveAttribute('href', '/');
  await expect(row.locator('a[hreflang="en"]')).toHaveAttribute('href', '/en/');
});
