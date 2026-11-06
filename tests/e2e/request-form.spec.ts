import { expect, test, type Page } from '@playwright/test';
import { open, urlOf } from '../support/site';

// the real contacts in src/config/site.ts: a request goes out only through these two
const WHATSAPP = '9647809000760';
const EMAIL = 'nasser@codbynasser.com';

/** keeps window.open from opening a tab, and remembers the address it was given */
const catchOpen = (page: Page) =>
  page.evaluate(() => {
    window.open = (url) => {
      document.body.dataset.opened = String(url);
      return null;
    };
  });

test('a request link fills the form, and the message is written as you type', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai&p=1'));
  const form = page.locator('form');
  await expect(form.locator('[name="service"][value="ai"]')).toBeChecked();
  await form.locator('[name="name"]').fill('سارة');
  await form.locator('textarea').fill('اختبار الرسالة');
  const bubble = page.locator('#bubble');
  await expect(bubble).toContainText('أنا سارة');
  await expect(bubble).toContainText('عندك أرقام، ولا تعرف ماذا تعني؟');
  await expect(bubble).toContainText('اختبار الرسالة');
  await expect(form.locator('button[type="submit"]')).toHaveText(/واتساب/);
  await form.locator('[name="via"][value="email"]').check({ force: true });
  await expect(form.locator('button[type="submit"]')).toHaveText(/البريد/);
});

test('a project link names the project, and clearing it takes it out of the message', async ({ page }) => {
  await open(page, urlOf('request', '?project=sber-diagrams'));
  const note = page.locator('#ctx');
  await expect(note).toBeVisible();
  await expect(page.locator('#ctxText')).toHaveText('مشروع مشابه: توليد المخططات من النصوص');
  await expect(page.locator('#bubble')).toContainText('مشروع مشابه: توليد المخططات من النصوص');
  await page.locator('#ctxClear').click();
  await expect(note).toBeHidden();
  await expect(page.locator('#bubble')).not.toContainText('مشروع مشابه');
  await expect(page.locator('[name="service"]').first()).toBeFocused();
});

test('sending too soon lists what to fix, in the order of the form', async ({ page }) => {
  await open(page, urlOf('request'));
  await page.locator('#sendMain').click();
  const summary = page.locator('#sum');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.locator('#sumList li')).toHaveText([
    'اختر الخدمة التي تحتاجها.',
    'اكتب سطراً واحداً على الأقل عن مشروعك.',
    'اكتب اسمك حتى أعرف مع من أتواصل.',
  ]);
  await expect(page.locator('[name="name"]')).toHaveAttribute('aria-invalid', 'true');
  // a field once checked is checked again as it changes
  await page.locator('[name="name"]').fill('سارة');
  await expect(page.locator('#e-name')).toHaveText('');
  await expect(page.locator('[name="name"]')).not.toHaveAttribute('aria-invalid');
  // the summary keeps up, and each of its lines leads to its field
  await expect(page.locator('#sumList li')).toHaveCount(2);
  await page.locator('#sumList a').last().click();
  await expect(page.locator('textarea')).toBeFocused();
});

test('a number may be typed in Arabic digits, and reaches the message as 0-9', async ({ page }) => {
  await open(page, urlOf('request'));
  const phone = page.locator('[name="phone"]');
  await phone.fill('٠٧٧٠١٢٣٤٥٦٧');
  await phone.blur();
  await expect(page.locator('#e-phone')).toHaveText('');
  await expect(page.locator('#bubble')).toContainText('07701234567');
  await phone.fill('12');
  await phone.blur();
  await expect(page.locator('#e-phone')).not.toHaveText('');
});

test('with no number the reply goes back to the same chat, but the other channel still needs one', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai&p=1'));
  await catchOpen(page);
  await page.locator('[name="name"]').fill('سارة');
  await page.locator('#sendAlt').click();
  await expect(page.locator('#e-phone')).not.toHaveText('');
  await expect(page.locator('form')).toBeVisible();
  // a problem chosen on the way here is enough to go on: the details are not required
  await page.locator('#sendMain').click();
  const text = [
    'طلب خدمة',
    'مرحباً ناصر، أنا سارة.',
    'الخدمة: الذكاء الاصطناعي والبيانات',
    'لفت نظري: عندك أرقام، ولا تعرف ماذا تعني؟',
    'أرجو الرد عليّ هنا.',
  ].join('\n');
  await expect(page.locator('body')).toHaveAttribute(
    'data-opened',
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,
  );
});

test('a complete request opens WhatsApp with the whole message, then offers a way back', async ({ page }) => {
  await open(page, urlOf('request', '?s=ai&p=1'));
  await catchOpen(page);
  await page.locator('textarea').fill('اختبار الرسالة');
  await page.locator('[name="name"]').fill('سارة');
  await page.locator('[name="phone"]').fill('+964 770 000 0000');
  await page.locator('#sendMain').click();
  const text = [
    'طلب خدمة',
    'مرحباً ناصر، أنا سارة.',
    'الخدمة: الذكاء الاصطناعي والبيانات',
    'لفت نظري: عندك أرقام، ولا تعرف ماذا تعني؟',
    'اختبار الرسالة',
    'أرجو الرد عليّ عبر واتساب: \u2066+964 770 000 0000\u2069',
  ].join('\n');
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  await expect(page.locator('body')).toHaveAttribute('data-opened', url);
  await expect(page.locator('form')).toBeHidden();
  await expect(page.locator('#doneTitle')).toHaveText('رسالتك جاهزة في واتساب');
  await expect(page.locator('#doneTitle')).toBeFocused();
  await expect(page.locator('#doneText')).toHaveText('اضغط «إرسال» هناك حتى يصلني طلبك، وأردّ عليك عبر واتساب.');
  const again = page.locator('#doneOpen');
  await expect(again).toHaveAttribute('href', url);
  await expect(again).toHaveAttribute('target', '_blank');
  await expect(again).toHaveText('افتح المحادثة مرة أخرى');
  await page.locator('#again').click();
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('#done')).toBeHidden();
  await expect(page.locator('#ctx')).toBeHidden();
  await expect(page.locator('textarea')).toHaveValue('');
});

test('«اطلب هذا الحل» on a service page sends that service and that problem to WhatsApp', async ({ page }) => {
  await open(page, urlOf('accounts'));
  await page.locator('article.prob', { hasText: 'تنشر باستمرار، والنتائج لا تتحرك؟' }).locator('a.ask').click();
  await page.waitForURL(/\/request\/\?/);
  await page.waitForLoadState('networkidle');
  await catchOpen(page);
  await page.locator('[name="name"]').fill('سارة');
  await page.locator('#sendMain').click();
  const text = [
    'طلب خدمة',
    'مرحباً ناصر، أنا سارة.',
    'الخدمة: الهوية والنمو الرقمي',
    'لفت نظري: تنشر باستمرار، والنتائج لا تتحرك؟',
    'أرجو الرد عليّ هنا.',
  ].join('\n');
  await expect(page.locator('body')).toHaveAttribute(
    'data-opened',
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,
  );
});

test('the other button sends the same request by email', async ({ page }) => {
  await open(page, urlOf('request', '?s=accounts'));
  await page.locator('textarea').fill('اختبار الرسالة');
  await page.locator('[name="name"]').fill('سارة');
  await page.locator('[name="phone"]').fill('+964 770 000 0000');
  await page.locator('#sendAlt').click();
  const body = [
    'مرحباً ناصر، أنا سارة.',
    'الخدمة: الهوية والنمو الرقمي',
    'اختبار الرسالة',
    'أرجو الرد عليّ عبر واتساب: \u2066+964 770 000 0000\u2069',
  ].join('\n');
  const url = `mailto:${EMAIL}?subject=${encodeURIComponent('طلب خدمة')}&body=${encodeURIComponent(body)}`;
  await expect(page.locator('#doneTitle')).toHaveText('رسالتك جاهزة في بريدك');
  await expect(page.locator('#doneOpen')).toHaveAttribute('href', url);
  await expect(page.locator('#doneOpen')).not.toHaveAttribute('target');
  await expect(page.locator('#doneOpen')).toHaveText('افتح رسالة البريد مرة أخرى');
});

test('the collaborator form writes its own message and checks the portfolio link', async ({ page }) => {
  await open(page, urlOf('join'));
  const form = page.locator('form');
  await form.locator('[name="name"]').fill('سارة');
  await form.locator('[name="portfolio"]').fill('my site');
  await form.locator('[name="portfolio"]').blur();
  await expect(page.locator('#e-portfolio')).toHaveText('اكتب رابطاً كاملاً يبدأ بـ https://');
  await form.locator('[name="portfolio"]').fill('https://example.com');
  await expect(page.locator('#e-portfolio')).toHaveText('');
  const bubble = page.locator('#bubble');
  await expect(bubble).toContainText('مرحباً ناصر، أنا سارة، وأريد أن أعمل معك.');
  await expect(bubble).toContainText('أعمالي: https://example.com');
  await expect(bubble.locator('.ph')).toHaveText(['تخصصك', 'خبرتك، وما تحب العمل عليه']);
});
