/** The manifesto, with motion: each line rises as it is reached, so the story reads in its order. */
import { $$ } from '@/scripts/dom';
import { gsap } from '@/scripts/motion';

export function animateManifesto() {
  $$('#manifesto [data-rise]').forEach((line) => {
    gsap.from(line, {
      autoAlpha: 0,
      y: 24,
      duration: 0.9,
      ease: 'expo.out',
      scrollTrigger: { trigger: line, start: 'top 88%', once: true },
    });
  });
}
