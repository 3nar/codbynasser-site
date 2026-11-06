/**
 * The echo: a pale double of a line ([data-echo]) sits behind it, and slides into place as the line settles.
 * The hero title and the question settle with their own scenes; every other echoed line settles once on a
 * clock when it comes into view. The double rests hidden, so a reader who lands below a line never sees it doubled.
 */
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

/** the echo of the line with this id */
export const echoOf = (id: string) => echoes.find((e) => e.el.id === id)!;

/** the lines with no scene of their own (goal lines, the closing line) */
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
