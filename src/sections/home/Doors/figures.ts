/**
 * The figure each door's liquid light keeps moving inside, at second t. A figure is six shapes,
 * [x, y, size, stretch, angle], in units of the screen's short side, around the figure's centre.
 * The keys are the doors' data-shape names.
 */
import { TAU } from '@/scripts/math';

export type Figure = (t: number) => [x: number, y: number, r: number, st: number, a: number][];

const FOLLOWERS = [
  { r: 0.085, d: 0.4, dd: 0.12, p: 26, q: 13, ph: 0 },
  { r: 0.07, d: 0.44, dd: 0.1, p: -34, q: 17, ph: 2.1 },
  { r: 0.065, d: 0.38, dd: 0.1, p: 21, q: 11, ph: 4 },
  { r: 0.055, d: 0.47, dd: 0.06, p: -29, q: 19, ph: 5.2 },
  { r: 0.045, d: 0.42, dd: 0.12, p: 17, q: 9, ph: 1.1 },
];

export const DOOR_FIGURES: Record<string, Figure> = {
  // a profile and its followers: one round body, and small drops that circle it each at its own pace (some the
  // other way), melting into it as they pass close
  content: (t) => [
    [0, 0, 0.17 * (1 + 0.04 * Math.sin((TAU * t) / 11)), 1, 0],
    ...FOLLOWERS.map((b): [number, number, number, number, number] => {
      const a = b.ph + (TAU * t) / b.p;
      const d = b.d + b.dd * Math.sin((TAU * t) / b.q + b.ph);
      return [Math.cos(a) * d, Math.sin(a) * d * 0.9, b.r, 1, 0];
    }),
  ],
  // work on the move: a ribbon rising toward the words; drops of two sizes run along it, swelling in at the start
  // and thinning out at the end, so the flow never jumps
  ai: (t) => {
    const L = 0.5;
    const a = -0.72;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const out: ReturnType<Figure> = [];
    for (let i = 0; i < 6; i++) {
      const p = (i / 6 + t / 16) % 1;
      const along = (2 * p - 1) * L;
      const wave = 0.035 * Math.sin(TAU * (1.6 * p - t / 10));
      out.push([
        along * c - wave * s,
        along * s + wave * c,
        (i % 2 ? 0.072 : 0.095) * Math.sin(Math.PI * p) ** 0.7,
        2,
        a,
      ]);
    }
    return out;
  },
  // a system being built: three layers, each in two pieces that slide along it, part and close again
  software: (t) => {
    const out: ReturnType<Figure> = [];
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 0.27;
      const slide = 0.04 * Math.sin((TAU * t) / (13 + 4 * i) + 2.1 * i);
      const gap = 0.19 + 0.09 * Math.sin((TAU * t) / (9 + 3 * i) + i);
      out.push([slide - gap, y, 0.1, 4, 0], [slide + gap, y, 0.1, 4, 0]);
    }
    return out;
  },
};
