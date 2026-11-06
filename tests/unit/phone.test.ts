import { describe, expect, it } from 'vitest';
import { asciiDigits, isPhone } from '@/lib/message/phone';

describe('phone numbers', () => {
  it('writes Arabic and Persian digits as 0-9, and leaves the rest alone', () => {
    expect(asciiDigits('+٩٦٤ ٧٧٠ ۱۲۳')).toBe('+964 770 123');
  });

  it('accepts a number however it is typed', () => {
    for (const number of [
      '٠٧٧٠١٢٣٤٥٦٧',
      '+٩٦٤ ٧٧٠ ١٢٣ ٤٥٦٧',
      '۰۷۷۰۱۲۳۴۵۶۷',
      '(0770) 123-4567',
      '0770.123.4567',
      '+964 770 123 4567',
    ]) {
      expect(isPhone(number), number).toBe(true);
    }
  });

  it('refuses what cannot be dialled', () => {
    for (const number of ['', '123', 'my number', '+', '0770x1234567', '12345678901234567']) {
      expect(isPhone(number), number).toBe(false);
    }
  });
});
