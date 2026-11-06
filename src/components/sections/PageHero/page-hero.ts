/** An inner page's first screen, with motion: its aura gathers once, as the page opens. */
import { $$ } from '@/scripts/dom';
import { gsap } from '@/scripts/motion';

export function animatePageHero() {
  $$('.page-hero .blobs').forEach((b) => {
    // a layer of its own only while it gathers (aura.css, .moving)
    const aura = b.closest('.aura');
    gsap.from(b, {
      opacity: 0,
      scale: 0.86,
      duration: 1.8,
      delay: 0.1,
      ease: 'expo.out',
      onStart: () => aura?.classList.add('moving'),
      onComplete: () => aura?.classList.remove('moving'),
    });
  });
}
