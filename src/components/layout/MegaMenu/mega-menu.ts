/**
 * The mega menus under the bar: a mouse opens one after a short pause (so passing over does nothing), a click or
 * Enter opens it too (the keyboard lands on its first link), and leaving the bar, a click outside, a link or
 * Escape closes it. Escape gives the focus back to the button that opened it.
 */
import { $, $$ } from '@/scripts/dom';

let mega: HTMLElement;
let scrim: HTMLElement;
let triggers: HTMLElement[] = [];
let openId: string | null = null;
let openedAt = 0;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let lastTrigger: HTMLElement | undefined;

const openMega = (id: string, { focus = false } = {}) => {
  clearTimeout(closeTimer);
  const btn = triggers.find((b) => b.dataset.mega === id);
  lastTrigger = btn;
  if (openId === id) return;
  openId = id;
  openedAt = performance.now();
  triggers.forEach((b) => b.setAttribute('aria-expanded', String(b === btn)));
  $$('.mega-panel').forEach((p) => p.classList.toggle('show', p.dataset.panel === id));
  const panel = $(`.mega-panel[data-panel="${id}"]`)!;
  mega.inert = false;
  mega.classList.add('opening');
  mega.style.height = `${panel.offsetHeight}px`;
  scrim.classList.add('on');
  if (focus) panel.querySelector('a')?.focus();
};

const closeMega = ({ restore = false } = {}) => {
  if (!openId) return;
  openId = null;
  triggers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
  mega.classList.remove('opening');
  mega.style.height = '0px';
  mega.inert = true;
  scrim.classList.remove('on');
  setTimeout(() => {
    if (!openId) $$('.mega-panel').forEach((p) => p.classList.remove('show'));
  }, 260);
  if (restore) lastTrigger?.focus();
};

/** drops a panel the mouse was about to open, and closes the open one */
export const cancelMega = () => {
  clearTimeout(hoverTimer);
  closeMega();
};

export function initMegaMenu() {
  const nav = $('#nav')!;
  mega = $('#mega')!;
  scrim = $('#scrim')!;
  triggers = $$('[data-mega]');
  triggers.forEach((b) => {
    const id = b.dataset.mega!;
    b.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(hoverTimer);
      if (openId) openMega(id);
      else hoverTimer = setTimeout(() => openMega(id), 90);
    });
    b.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    b.addEventListener('click', (e) => {
      if (openId === id) {
        if (performance.now() - openedAt > 400) closeMega();
        return;
      }
      // detail is 0 when the keyboard pressed the button
      openMega(id, { focus: e.detail === 0 });
    });
  });
  nav.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') closeTimer = setTimeout(closeMega, 180);
  });
  mega.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  nav.addEventListener('focusout', (e) => {
    if (openId && !nav.contains(e.relatedTarget as Node | null)) closeMega();
  });
  scrim.addEventListener('click', () => closeMega());
  mega.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) closeMega();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId) closeMega({ restore: true });
  });
}
