/**
 * The three doors: the liquid light takes the figure of the door the reader stands at and keeps moving inside
 * it; walking to the next door melts one figure into the other. The switch above them follows: its thumb slides
 * under the current door, and a click on it walks to that door.
 */
import { createLiquidLight } from '@/components/effects/LiquidLight/liquid-light';
import { $, $$, dirSign } from '@/scripts/dom';
import { clamp, smooth, TAU } from '@/scripts/math';
import { canAnimate } from '@/scripts/motion';
import { DOOR_FIGURES, type Figure } from './figures';

const ease = (t: number) => t * t * (3 - 2 * t);

export function initDoors() {
  const body = $('#pillarsBody');
  if (!body) return;
  const pillars = $$('.pillar', body);
  const pAura = $('#pillarAura')!;
  const doorsNav = $('#doorsNav')!;
  const links = $$<HTMLAnchorElement>('a', doorsNav);
  const thumb = $('.thumb', doorsNav)!;
  const figs = pillars.map((p) => DOOR_FIGURES[p.dataset.shape!]);
  let cur = 0;

  // where the reader stands, as a fractional door: 0 while the first door is centred, 1 at the second, and so on.
  // a figure holds through the middle of its door and changes only while two doors swap places
  const doorAt = () => {
    const mid = innerHeight / 2;
    const centres = pillars.map((p) => {
      const r = p.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    if (mid <= centres[0]) return 0;
    for (let i = 0; i < centres.length - 1; i++) {
      if (mid < centres[i + 1])
        return i + ease(clamp(0, 1, ((mid - centres[i]) / (centres[i + 1] - centres[i]) - 0.2) / 0.6));
    }
    return centres.length - 1;
  };

  // f is the door the light shows, fTo the door the reader stands at; a critically damped spring (no overshoot)
  // carries one to the other, so the light keeps its speed between wheel notches and never jerks
  let f = canAnimate ? doorAt() : 0;
  let fv = 0;
  let fTo = f;
  let edge = 0.5;
  let top = 0.1;
  let words = 0.35;
  let side = true;
  let room = true;
  const omega = TAU / 0.6;
  const fx = createLiquidLight($<HTMLCanvasElement>('canvas', pAura)!, {
    // half the softness of «اعمل معي»: the figures are smaller, and must stay readable as figures
    blur: (w) => clamp(1, 3, Math.round(w * 0.008)),
    ink: 0.85,
    ptr: 0.07,
    // where the words are, measured (canvas fractions): when they leave room on the left (a computer, a wide
    // tablet), the figures sit there; otherwise in the room between the bar and the first line of the door that
    // starts highest, with each door standing in the middle of the screen
    layout: (r) => {
      // the room before the words, counted from the canvas's own edge (the canvas is mirrored on left-to-right pages)
      const copy = pillars[0].firstElementChild!.getBoundingClientRect();
      const left = (dirSign > 0 ? copy.left - r.left : r.right - copy.right) / r.width;
      side = left >= 0.4;
      edge = clamp(0.3, 0.7, left);
      const view = r.height / 1.04;
      const inset = (r.height * 0.02) / 1.04;
      const first = Math.min(
        ...pillars.map((p) => {
          const b = p.getBoundingClientRect();
          return (view - b.height) / 2 + p.firstElementChild!.getBoundingClientRect().top - b.top;
        }),
      );
      top = ($('.nav-bar')!.offsetHeight + inset) / r.height;
      words = clamp(top + 0.05, 0.9, (first + inset) / r.height);
      // a short phone leaves no room above the words either: there the light steps back behind them instead, faint
      room = side || (words - top) * r.height >= 150;
      pAura.classList.toggle('behind', !room);
    },
    // a phone's canvas is small, so it gets finer pixels to keep the figures readable
    scale: () => (innerWidth >= 700 ? 12 : 6),
    shapes: (t, _wide, uw, uh) => {
      const cx = side ? edge * 0.5 * uw : 0.5 * uw;
      const cy = (side ? 0.52 : room ? (top + words) / 2 : 0.3) * uh;
      const sc = side ? clamp(0.6, 0.95, edge * uw * 0.92) : room ? clamp(0.4, 0.85, (words - top) * uh) : 0.85;
      const i = Math.floor(f);
      const k = f - i;
      const out: { x: number; y: number; r: number; st: number; a: number }[] = [];
      // between two doors both figures are drawn thinner, one thinning out as the other fills in; where they
      // overlap they melt together
      const add = (fig: Figure, w: number) => {
        if (w > 0.001)
          for (const [x, y, r, st, a] of fig(t))
            out.push({ x: cx + x * sc, y: cy + y * sc, r: r * sc * w ** 0.75, st, a });
      };
      add(figs[i], 1 - k);
      if (k > 0) add(figs[Math.min(i + 1, figs.length - 1)], k);
      return out;
    },
    mask: (nx, ny) =>
      side
        ? 1 - smooth(edge - 0.12, edge + 0.03, nx)
        : room
          ? 1 - smooth(words - 0.04, words + 0.02, ny)
          : 1 - smooth(0.55, 0.85, ny),
    busy: () => Math.abs(fTo - f) > 1e-3 || Math.abs(fv) > 1e-3,
    step: (dt) => {
      fv += (omega * omega * (fTo - f) - 2 * omega * fv) * dt;
      f = clamp(0, figs.length - 1, f + fv * dt);
    },
  });

  // the switch: its thumb slides under the door you are standing at
  const placeThumb = () => {
    const n = doorsNav.getBoundingClientRect();
    const r = links[cur].getBoundingClientRect();
    thumb.style.width = `${r.width}px`;
    thumb.style.transform = `translateX(${dirSign > 0 ? r.right - n.right + 4 : r.left - n.left - 4}px)`;
  };
  const setDoor = (k: number) => {
    if (k === cur && body.classList.contains('live')) return;
    cur = k;
    pillars.forEach((p, i) => p.classList.toggle('on', i === k));
    links.forEach((a, i) => (i === k ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    body.classList.add('live');
    placeThumb();
    if (!canAnimate) {
      f = k;
      fx.draw();
    }
  };
  // the door under the middle of the screen; above the first or past the last, the nearest one
  let raf = 0;
  const pickDoor = () => {
    raf = 0;
    if (canAnimate) fTo = doorAt();
    const mid = innerHeight / 2;
    const first = pillars[0].getBoundingClientRect();
    const last = pillars[pillars.length - 1].getBoundingClientRect();
    doorsNav.classList.toggle('at', first.top <= innerHeight * 0.25 && last.bottom >= innerHeight * 0.75);
    if (first.top > mid) return setDoor(0);
    if (last.bottom <= mid) return setDoor(pillars.length - 1);
    pillars.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) setDoor(i);
    });
  };
  addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(pickDoor);
    },
    { passive: true },
  );
  addEventListener('resize', () => {
    pickDoor();
    placeThumb();
  });
  pickDoor();
  // the switch's words set the thumb's width, so it is measured again whenever a font arrives: fonts.ready can
  // settle before a face the switch uses has even been asked for
  document.fonts.ready.then(placeThumb);
  document.fonts.addEventListener('loadingdone', placeThumb);
  // a click on the switch walks to that door
  links.forEach((a, i) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTo({ top: pillars[i].getBoundingClientRect().top + scrollY, behavior: canAnimate ? 'smooth' : 'auto' });
      history.replaceState(null, '', a.hash);
    }),
  );
}
