/** Short DOM queries shared by every behaviour. */

/** the first element matching the selector, inside root (the page by default) */
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector);

/**
 * 1 on right-to-left pages (Arabic), -1 on left-to-right ones (English, Russian). The scenes were drawn for
 * Arabic; a sideways offset multiplied by it moves the mirror way on a left-to-right page.
 */
export const dirSign = document.documentElement.dir === 'ltr' ? -1 : 1;

/** every element matching the selector, as an array */
export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(selector),
];
