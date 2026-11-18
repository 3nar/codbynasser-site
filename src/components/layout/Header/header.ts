import { $, $$ } from '@/scripts/dom';
import { desktop } from '@/scripts/media';

interface Stage {
  top: number;
  bottom: number;
  dark: boolean;
  hero: boolean;
}

let nav: HTMLElement;
let stages: Stage[] = [];
let heroNight = false;

export const mapStages = () => {
  stages = $$('[data-stage]')
    .filter((el) => el.dataset.only !== 'phone' || !desktop.matches)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top + scrollY,
        bottom: r.bottom + scrollY,
        dark: el.dataset.stage === 'dark',
        hero: el.id === 'hero' || el.hasAttribute('data-dusk'),
      };
    });
};

export const syncNav = () => {
  const y = scrollY + 26;
  let s: Stage | null = null;
  for (const st of stages) if (y >= st.top && y < st.bottom) s = st;
  nav.classList.toggle('on-dark', s ? (s.hero ? heroNight : s.dark) : false);
};

export const setHeroNight = (night: boolean) => {
  if (night === heroNight) return;
  heroNight = night;
  syncNav();
};

export const resetHeroNight = () => {
  heroNight = false;
};

export function initHeader() {
  nav = $('#nav')!;
  addEventListener('scroll', syncNav, { passive: true });
  addEventListener('resize', () => {
    mapStages();
    syncNav();
  });
}
