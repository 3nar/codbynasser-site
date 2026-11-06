/**
 * The phone menu: the bar's toggle opens it over the page, which stops scrolling and leaves the keyboard's reach
 * (inert) until it closes. A link inside it or Escape closes it. The toggle's label (open / close) comes from the
 * page's language (ScriptData "menu", rendered by MobileSheet.astro).
 */
import { updateDock } from '@/components/layout/Dock/dock';
import { $ } from '@/scripts/dom';
import { readScriptData } from '@/scripts/script-data';

export interface MenuTexts {
  open: string;
  close: string;
}

export function initMobileSheet() {
  const toggle = $('#menuToggle')!;
  const sheet = $('#sheet')!;
  const nav = $('#nav')!;
  const main = $('#main')!;
  const footer = $('footer')!;
  const texts = readScriptData<MenuTexts>('menu')!;
  const setSheet = (open: boolean) => {
    sheet.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? texts.close : texts.open);
    main.inert = open;
    footer.inert = open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    nav.classList.toggle('sheet-open', open);
    updateDock();
  };
  toggle.addEventListener('click', () => setSheet(!sheet.classList.contains('open')));
  sheet.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setSheet(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !sheet.classList.contains('open')) return;
    setSheet(false);
    toggle.focus();
  });
}
