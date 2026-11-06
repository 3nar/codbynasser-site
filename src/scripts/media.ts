/** The screen conditions the behaviours depend on. */

/** the computer layout; the same breakpoint as the stylesheets */
export const desktop = matchMedia('(min-width: 1024px)');

/** a real pointer that can hover: a mouse or a trackpad, not a touch screen */
export const fine = matchMedia('(hover: hover) and (pointer: fine)');
