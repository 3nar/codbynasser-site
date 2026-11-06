/**
 * Every grey band unrolls one step at a time with the scroll: into the light after the network, back into the
 * dark before the close. Its line, when it has one, rises in after.
 */
import { $, $$ } from '@/scripts/dom';
import { gsap } from '@/scripts/motion';

export function animateSpectrum() {
  $$('.spectrum').forEach((band) => {
    gsap.from($$('i', band), {
      scaleX: 0,
      ease: 'power2.out',
      stagger: 0.06,
      scrollTrigger: { trigger: band, start: 'top 92%', end: 'bottom 55%', scrub: 0.35 },
    });
    const line = $('p', band);
    if (line)
      gsap.from(line, {
        opacity: 0,
        y: 10,
        scrollTrigger: { trigger: band, start: 'top 70%', end: 'center 50%', scrub: 0.35 },
      });
  });
}
