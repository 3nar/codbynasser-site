import { describe, expect, it } from 'vitest';
import { links, SITE } from '@/config/site';

describe('contact links', () => {
  it('opens WhatsApp with the message written in', () => {
    expect(links.whatsapp('طلب خدمة\nمرحباً (1)!')).toBe(
      `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent('طلب خدمة\nمرحباً (1)!')}`,
    );
    expect(links.whatsapp()).toBe(`https://wa.me/${SITE.contact.whatsapp}`);
  });

  it('reaches the real accounts', () => {
    expect(links.whatsapp()).toBe('https://wa.me/9647809000760');
    expect(links.telegram()).toBe('https://t.me/codbynasser');
    expect(links.instagram()).toBe('https://www.instagram.com/codbynasser/');
    expect(links.email()).toBe('mailto:nasser@codbynasser.com');
  });

  it('opens an email with its subject and body, encoded the way the form always sent them', () => {
    const subject = 'طلب خدمة';
    const body = 'سطر أول\nرقمي: +964 (770)!';
    expect(links.email(subject, body)).toBe(
      `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
    expect(links.email()).toBe(`mailto:${SITE.contact.email}`);
    expect(links.email('', body)).toBe(`mailto:${SITE.contact.email}?body=${encodeURIComponent(body)}`);
  });
});
