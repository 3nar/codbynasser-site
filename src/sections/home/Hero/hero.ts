/**
 * The home page's first screen, with motion: the line arrives with its echo, the ghost comes out of him and
 * trails him a beat late wherever the pointer goes. Leaving it on the computer, the ghost walks out of frame,
 * the words lift away and the dusk rises with the scroll; on the phone the ghost walks out alone.
 */
import { echoOf } from '@/components/effects/Echo/echo';
import { resetHeroNight, setHeroNight } from '@/components/layout/Header/header';
import { $, dirSign } from '@/scripts/dom';
import { fine } from '@/scripts/media';
import { gsap, mm } from '@/scripts/motion';

export function animateHero() {
  const man = $<HTMLImageElement>('#man');
  if (!man) return;
  // the intro waits for the fonts and the photo, but never more than 0.7 s
  Promise.race([
    Promise.all([document.fonts.ready, man.decode ? man.decode().catch(() => {}) : 0]),
    new Promise((r) => setTimeout(r, 700)),
  ]).then(() => {
    document.documentElement.classList.remove('intro');
    const e0 = echoOf('hero-title');
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .from(
        '#ghost',
        { xPercent: 9, autoAlpha: 0, filter: 'blur(6px)', duration: 2, ease: 'power3.out', clearProps: 'filter' },
        0.15,
      )
      .from('.hero [data-in]', { y: 18, opacity: 0, duration: 1, stagger: 0.08 }, 0.35)
      .from(e0.el, { opacity: 0, duration: 0.9 }, 0.45)
      .fromTo(
        e0.shade,
        { x: -36 * dirSign, y: 10, autoAlpha: 0.9, filter: 'blur(8px)' },
        { x: 0, y: 0, autoAlpha: 0, filter: 'blur(0px)', duration: 1.6 },
        0.45,
      );
  });

  // the ghost trails him, a beat late, wherever the pointer goes
  if (fine.matches) {
    const gx = gsap.quickTo('#ghostWrap', 'x', { duration: 1.4, ease: 'power3' });
    const mx = gsap.quickTo('#man', 'x', { duration: 0.8, ease: 'power3' });
    $('#hero')!.addEventListener('pointermove', (e) => {
      // the photo is mirrored on left-to-right pages (hero.css), so the pointer is read the mirror way too
      const n = (e.clientX / innerWidth - 0.5) * dirSign;
      gx(n * -16);
      mx(n * -4);
    });
  }

  mm.add('(min-width: 1024px)', () => {
    // leaving: the ghost walks out of frame and the words lift away
    gsap
      .timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.35 } })
      .fromTo(
        '#ghostWrap',
        { xPercent: 0, autoAlpha: 1, filter: 'blur(0px)' },
        { xPercent: -22, autoAlpha: 0, filter: 'blur(12px)', ease: 'power1.in', duration: 0.7, immediateRender: false },
        0,
      )
      .fromTo(
        '.hero-copy',
        { y: 0, opacity: 1 },
        { y: -60, opacity: 0, ease: 'power1.in', duration: 0.5, immediateRender: false },
        0.1,
      )
      .to({}, { duration: 0.3 }, 0.7);
    // the dusk is tied to scroll with no lag, so the dark always meets the next scene exactly at the edge
    gsap.fromTo(
      '#dusk',
      { scaleY: 0 },
      {
        scaleY: 1.35,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (s) => setHeroNight(s.progress > 0.7),
        },
      },
    );
    return resetHeroNight;
  });
  mm.add('(max-width: 1023px)', () => {
    gsap.fromTo(
      '#ghostWrap',
      { xPercent: 0, autoAlpha: 1 },
      {
        xPercent: -18,
        autoAlpha: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '#portrait', start: 'top -8%', end: 'bottom 35%', scrub: 0.35 },
      },
    );
  });
}
