/** «لماذا أنا؟», with motion: the desk photo settles into place as it comes up. */
import { $ } from '@/scripts/dom';
import { gsap } from '@/scripts/motion';

export function animateWhyMe() {
  if (!$('#desk')) return;
  gsap.fromTo(
    '#desk img',
    { scale: 1.06 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: '#desk', start: 'top bottom', end: 'bottom 75%', scrub: 0.35 },
    },
  );
}
