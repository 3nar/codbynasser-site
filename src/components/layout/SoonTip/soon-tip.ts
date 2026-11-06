/**
 * The sections still being prepared: the mouse closes any open panel on its way over one, a tap shows the
 * «قريباً» note for a moment, and Escape hides every note until the pointer or the focus comes back.
 */
import { cancelMega } from '@/components/layout/MegaMenu/mega-menu';
import { $, $$ } from '@/scripts/dom';

export function initSoonTips() {
  const items = $$('.soon-item');
  items.forEach((item) => {
    const btn = $('.soon', item)!;
    let t: ReturnType<typeof setTimeout> | undefined;
    const showTip = (on: boolean) => {
      clearTimeout(t);
      item.classList.toggle('tip-on', on);
      if (on) t = setTimeout(() => item.classList.remove('tip-on'), 2600);
    };
    item.addEventListener('pointerenter', (e) => {
      item.classList.remove('tip-off');
      if (e.pointerType === 'mouse') cancelMega();
    });
    btn.addEventListener('focus', () => item.classList.remove('tip-off'));
    btn.addEventListener('click', () => showTip(!item.classList.contains('tip-on')));
    btn.addEventListener('blur', () => showTip(false));
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    items.forEach((i) => {
      i.classList.remove('tip-on');
      i.classList.add('tip-off');
    });
  });
}
