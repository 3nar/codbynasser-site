const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';

export const asciiDigits = (text: string) =>
  text.replace(/[٠-٩۰-۹]/g, (digit) => String(EASTERN_DIGITS.indexOf(digit) % 10));

export const isPhone = (text: string) => /^\+?\d{8,16}$/.test(asciiDigits(text).replace(/[\s().-]/g, ''));
