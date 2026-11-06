/**
 * Fills a text's places: {name} takes the value passed under that name, and a place with no value stays as it is.
 * Shared by t() on the server and by the browser scripts, which receive their texts unfilled.
 *
 *   fill('التالي: {name}', { name: 'الذكاء' })   → «التالي: الذكاء»
 */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
