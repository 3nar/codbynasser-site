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
