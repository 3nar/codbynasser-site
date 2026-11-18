import { $, $$ } from '@/scripts/dom';

export function initLanguageMenu() {
  if (location.search || location.hash) {
    $$<HTMLAnchorElement>('a.lang[hreflang]').forEach((a) => {
      a.search = location.search;
      a.hash = location.hash;
    });
  }
  const btn = $('#langBtn')!;
  const list = $('#langs')!;
  const setOpen = (open: boolean) => {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => setOpen(!list.classList.contains('open')));
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.end')) setOpen(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !list.classList.contains('open')) return;
    setOpen(false);
    btn.focus();
  });
}
