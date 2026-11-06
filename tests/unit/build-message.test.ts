import { describe, expect, it } from 'vitest';
import forms from '@/i18n/ui/ar/forms.json';
import { escapeHtml, messageLines, previewLines, subjectOf, type MessageTexts } from '@/lib/message/build-message';

// the Arabic texts the site ships
const texts: MessageTexts = {
  ...forms.message,
  channels: forms.channels,
};

describe('the request message', () => {
  it('writes every line of a service request, with what the link chose', () => {
    const lines = messageLines(
      {
        kind: 'service',
        via: 'whatsapp',
        context: { label: 'لفت نظري', text: 'عندك أرقام، ولا تعرف ماذا تعني؟' },
        fields: { name: 'سارة', service: 'الذكاء الاصطناعي', details: 'عندي متجر ملابس', phone: '+964 770 000 0000' },
      },
      texts,
    );
    expect(lines).toEqual([
      'مرحباً ناصر، أنا سارة.',
      'الخدمة: الذكاء الاصطناعي',
      'لفت نظري: عندك أرقام، ولا تعرف ماذا تعني؟',
      'عندي متجر ملابس',
      'أرجو الرد عليّ عبر واتساب: \u2066+964 770 000 0000\u2069',
    ]);
  });

  it('writes a collaborator request, and leaves out the portfolio line when there is none', () => {
    const input = {
      kind: 'join' as const,
      via: 'email',
      fields: {
        name: 'سارة',
        specialty: 'التصميم',
        portfolio: 'https://example.com',
        about: 'أحب العمل الدقيق',
        email: 'sara@example.com',
      },
    };
    expect(messageLines(input, texts)).toEqual([
      'مرحباً ناصر، أنا سارة، وأريد أن أعمل معك.',
      'تخصصي: التصميم',
      'أعمالي: https://example.com',
      'أحب العمل الدقيق',
      'أرجو الرد عليّ عبر البريد: \u2066sara@example.com\u2069',
    ]);
    expect(messageLines({ ...input, fields: { ...input.fields, portfolio: '' } }, texts)).not.toContain(
      'أعمالي: https://example.com',
    );
  });

  it('shows each empty field as a marked gap in the preview, and as nothing in the message', () => {
    const input = { kind: 'service' as const, via: 'whatsapp', fields: {} };
    expect(previewLines(input, texts)).toEqual([
      'مرحباً ناصر، أنا <span class="ph">اسمك</span>.',
      'الخدمة: <span class="ph">الخدمة</span>',
      '<span class="ph">مشروعك أو مشكلتك، بسطرين أو ثلاثة</span>',
      'أرجو الرد عليّ هنا.',
    ]);
    expect(messageLines(input, texts)).toEqual(['مرحباً ناصر، أنا .', 'الخدمة: ', 'أرجو الرد عليّ هنا.']);
  });

  it('names the email in place of the phone when the reply goes by email', () => {
    const lines = previewLines({ kind: 'join', via: 'email', fields: { email: 'a@b.co' } }, texts);
    expect(lines.at(-1)).toBe('أرجو الرد عليّ عبر البريد: \u2066a@b.co\u2069');
  });

  it('escapes the visitor’s words in the preview only, and never reads them as places to fill', () => {
    const fields = { name: '<b>&"{service}$&', details: 'x' };
    expect(previewLines({ kind: 'service', via: 'whatsapp', fields }, texts)[0]).toBe(
      'مرحباً ناصر، أنا &lt;b&gt;&amp;&quot;{service}$&amp;.',
    );
    expect(messageLines({ kind: 'service', via: 'whatsapp', fields }, texts)[0]).toBe(
      'مرحباً ناصر، أنا <b>&"{service}$&.',
    );
  });

  it('names each kind of request', () => {
    expect(subjectOf('service', texts)).toBe('طلب خدمة');
    expect(subjectOf('join', texts)).toBe('طلب تعاون');
  });

  it('escapes the four characters HTML reads', () => {
    expect(escapeHtml(`a<b>&"c'`)).toBe(`a&lt;b&gt;&amp;&quot;c'`);
  });
});
