import { expect, test } from '@playwright/test';
import { open, urlOf } from '../support/site';

test('the menu sheet opens over the page and closes again', { tag: '@phone' }, async ({ page }) => {
  await open(page, urlOf('accounts'));
  const toggle = page.locator('#menuToggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'أغلق القائمة');
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await expect(page.locator('#main')).toHaveJSProperty('inert', true);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-label', 'افتح القائمة');
  await expect(page.locator('#main')).toHaveJSProperty('inert', false);
});
