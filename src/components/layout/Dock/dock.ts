/**
 * The phone's request bar: on screen from the first view, so there is always something to tap. It steps aside
 * while the menu is open or while one of the page's own request buttons ([data-dock-hide]) is on screen.
 */
import { $, $$ } from '@/scripts/dom';

let dock: HTMLElement;
let sheet: HTMLElement;
let ownCtas: HTMLElement[] = [];

const ctaOnScreen = () =>
  ownCtas.some((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  });

export const updateDock = () => dock.classList.toggle('show', !ctaOnScreen() && !sheet.classList.contains('open'));

export function initDock() {
  dock = $('#dock')!;
  sheet = $('#sheet')!;
  ownCtas = $$('[data-dock-hide]');
  let raf = 0;
  addEventListener(
    'scroll',
    () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          updateDock();
        });
    },
    { passive: true },
  );
  addEventListener('resize', updateDock);
  updateDock();
}
