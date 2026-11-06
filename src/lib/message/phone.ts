/** Phone numbers as people really type them: Arabic or Persian digits, spaces, dashes, dots and brackets. */

const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';

/** the same text with Arabic and Persian digits written as 0-9, which is what WhatsApp and a phone can dial */
export const asciiDigits = (text: string) =>
  text.replace(/[٠-٩۰-۹]/g, (digit) => String(EASTERN_DIGITS.indexOf(digit) % 10));

/** long enough to dial, with or without a country code, whatever separates the digits */
export const isPhone = (text: string) => /^\+?\d{8,16}$/.test(asciiDigits(text).replace(/[\s().-]/g, ''));
