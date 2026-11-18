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
