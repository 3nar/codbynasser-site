import { expect, test } from '@playwright/test';
import { open, urlOf } from '../support/site';

test('the footer reaches each contact app, each name after its icon', async ({ page }) => {
  await open(page, urlOf('home'));
  const apps = page.locator('footer a.app');
  await expect(apps).toHaveText(['واتساب', 'تيليكرام', 'إنستكرام', 'البريد']);
  expect(await apps.evaluateAll((all) => all.map((a) => a.getAttribute('href')))).toEqual([
    'https://wa.me/9647809000760',
    'https://t.me/codbynasser',
    'https://www.instagram.com/codbynasser/',
    'mailto:nasser@codbynasser.com',
  ]);
  await expect(apps.locator('svg')).toHaveCount(4);
});

test('the sections still being prepared show only as «قريباً», in the footer and the phone menu', async ({ page }) => {
  await open(page, urlOf('home'));
  await expect(page.locator('footer .off')).toHaveText(['الأعمال', 'الأكاديمية', 'للشركات']);
  await expect(page.locator('#sheet .sheet-soon')).toHaveText(['الأعمالقريباً', 'الأكاديميةقريباً', 'للشركاتقريباً']);
});

test('automation is a fix of the AI division, reached from the services menu', async ({ page }) => {
  await open(page, urlOf('home'));
  const fix = page.locator('[data-panel="services"] a', { hasText: 'المساعدات الذكية والأتمتة' });
  await expect(fix).toHaveAttribute('href', /\/services\/ai\/#p4$/);
});

// the bar menus exist on desktop only
test.describe('bar menus', { tag: '@desktop' }, () => {
  // opened from the keyboard: a mouse resting on the button would also start the menu's hover-open timer,
  // which makes the open and close race the test on a busy machine
  test('the services menu opens from the keyboard, and Escape closes it', async ({ page }) => {
    await open(page, urlOf('home'));
    const trigger = page.locator('[data-mega="services"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect
      .poll(() => page.locator('#mega').evaluate((m) => m.getBoundingClientRect().height))
      .toBeGreaterThan(100);
    // three divisions and their fourteen fixes, then the three next steps
    await expect(page.locator('[data-panel="services"] a')).toHaveCount(20);
    // the keyboard path moves focus into the panel's first link
    await expect(page.locator('[data-panel="services"] a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mega')).toHaveJSProperty('inert', true);
    await expect(trigger).toBeFocused();
  });

  test('a click opens the services menu', async ({ page }) => {
    await open(page, urlOf('home'));
    const trigger = page.locator('[data-mega="services"]');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mega')).toHaveJSProperty('inert', false);
  });

  test('the language menu opens and closes', async ({ page }) => {
    await open(page, urlOf('home'));
    const btn = page.locator('#langBtn');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#langs')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('a page still being prepared shows its note when tapped', async ({ page }) => {
    await open(page, urlOf('home'));
    const item = page.locator('.soon-item').first();
    // aria-disabled on purpose (the page is not ready), so Playwright would wait for it to become enabled
    await item.locator('.soon').click({ force: true });
    await expect(item).toHaveClass(/tip-on/);
  });
});
