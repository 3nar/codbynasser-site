/**
 * The about page's top, with motion: his ghost settles beside him once. Leaving it on the computer is the home
 * page's leaving: the ghost walks out, the words lift away, and the dusk rises with the scroll, so the white top
 * meets the black story with no seam.
 */
import { resetHeroNight, setHeroNight } from '@/components/layout/Header/header';
import { $, $$ } from '@/scripts/dom';
import { gsap, mm } from '@/scripts/motion';

export function animateAboutHero() {
  $$('.about-hero .ghost-wrap').forEach((g) =>
    gsap.from(g, { xPercent: 7, opacity: 0, duration: 2, delay: 0.2, ease: 'power3.out' }),
  );
  if (!$('#aboutDusk')) return;
  mm.add('(min-width: 1024px)', () => {
    gsap
      .timeline({ scrollTrigger: { trigger: '.about-hero', start: 'top top', end: 'bottom top', scrub: 0.35 } })
      .fromTo(
        '.about-hero .ghost-wrap',
        { xPercent: 0, autoAlpha: 1, filter: 'blur(0px)' },
        { xPercent: -22, autoAlpha: 0, filter: 'blur(12px)', ease: 'power1.in', duration: 0.7, immediateRender: false },
        0,
      )
      .fromTo(
        '.about-hero .copy',
        { y: 0, opacity: 1 },
        { y: -60, opacity: 0, ease: 'power1.in', duration: 0.5, immediateRender: false },
        0.1,
      )
      .to({}, { duration: 0.3 }, 0.7);
    gsap.fromTo(
      '#aboutDusk',
      { scaleY: 0 },
      {
        scaleY: 1.35,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.about-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (st) => setHeroNight(st.progress > 0.7),
        },
      },
    );
    return resetHeroNight;
  });
}
