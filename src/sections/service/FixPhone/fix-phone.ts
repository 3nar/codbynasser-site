/**
 * A service page's phone: it shows the fix for the problem you are reading. The problem holding the middle of the
 * screen is the one shown, its screen is on the phone, and its segment of the progress line fills as you read.
 * Each problem is a full screen tall, so the one in the middle is alone on the screen. On phones each problem has
 * its own screen, which fills in once as it comes into view.
 */
import { $, $$ } from '@/scripts/dom';
import { clamp } from '@/scripts/math';
import { canAnimate } from '@/scripts/motion';

export function initFixPhone() {
  const body = $('#accBody');
  if (!body) return;
  const glass = $('#glass')!;
  const probs = $$('.prob', body);
  const screens = probs.map((p) => glass.appendChild(p.querySelector('.scr')!.cloneNode(true) as HTMLElement));
  screens[0].classList.add('show');
  $('.dev-col', body)!.style.gridRow = `1 / span ${probs.length}`;
  body.classList.add('dev-ready');
  let active = -1;
  const devName = $('#devName');
  const names = devName ? devName.dataset.names!.split('|') : [];
  const setActive = (k: number) => {
    if (k === active) return;
    // the new screen comes from the side the reader is scrolling toward, the old one leaves the other way
    const dir = k > active ? 1 : -1;
    active = k;
    probs.forEach((p, i) => p.classList.toggle('on', i === k));
    screens.forEach((sc, i) => {
      if (i === k) {
        if (canAnimate && !sc.classList.contains('show')) {
          sc.style.transition = 'none';
          sc.style.transform = `translateY(${dir * 14}px)`;
          void sc.offsetWidth;
          sc.style.transition = '';
          sc.style.transform = '';
        }
        sc.classList.add('show', 'on');
      } else {
        if (canAnimate && sc.classList.contains('show')) sc.style.transform = `translateY(${dir * -10}px)`;
        sc.classList.remove('show', 'on');
      }
    });
    if (devName) devName.textContent = names[k];
    body.classList.add('live');
  };
  const segs = $$('#devProg b');
  let raf = 0;
  const pick = () => {
    raf = 0;
    const mid = innerHeight / 2;
    const rs = probs.map((p) => p.getBoundingClientRect());
    let k = rs.findIndex((r) => r.top <= mid && r.bottom > mid);
    if (k < 0 && rs[rs.length - 1].bottom <= mid) k = probs.length - 1;
    segs.forEach((b, i) => (b.style.transform = `scaleX(${clamp(0, 1, (mid - rs[i].top) / rs[i].height)})`));
    if (k >= 0) setActive(k);
    // before the first problem reaches the middle, its screen still fills in as soon as the phone comes into view
    else if (active < 0 && glass.getBoundingClientRect().top < innerHeight * 0.85) screens[0].classList.add('on');
  };
  addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(pick);
    },
    { passive: true },
  );
  addEventListener('resize', pick);
  pick();
  const fillOnce = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('on');
        fillOnce.unobserve(en.target);
      }),
    { threshold: 0.4 },
  );
  probs.forEach((p) => fillOnce.observe(p.querySelector('.scr')!));
}
