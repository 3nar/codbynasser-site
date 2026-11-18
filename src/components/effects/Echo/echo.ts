import { $$, dirSign } from '@/scripts/dom';
import { gsap, ScrollTrigger } from '@/scripts/motion';

export interface Echo {
  el: HTMLElement;
  shade: HTMLElement;
}

let echoes: Echo[] = [];

export function initEchoes() {
  echoes = $$('[data-echo]').map((el) => {
    const shade = document.createElement('span');
    shade.className = 'shade';
    shade.setAttribute('aria-hidden', 'true');
    shade.innerHTML = el.innerHTML;
    el.classList.add('echo');
    el.appendChild(shade);
    return { el, shade };
  });
}

export const echoOf = (id: string) => echoes.find((e) => e.el.id === id)!;

export function settleEchoes() {
  echoes
    .filter((e) => !['hero-title', 'cover-q'].includes(e.el.id))
    .forEach(({ el, shade }) => {
      gsap.set(shade, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () =>
          gsap.fromTo(
            shade,
            { x: -44 * dirSign, autoAlpha: 0.9 },
            { x: 0, autoAlpha: 0, duration: 1.4, ease: 'expo.out', overwrite: true },
          ),
        onLeaveBack: () => gsap.set(shade, { autoAlpha: 0, overwrite: true }),
      });
    });
}
