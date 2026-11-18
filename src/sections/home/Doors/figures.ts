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
  content: (t) => [
    [0, 0, 0.17 * (1 + 0.04 * Math.sin((TAU * t) / 11)), 1, 0],
    ...FOLLOWERS.map((b): [number, number, number, number, number] => {
      const a = b.ph + (TAU * t) / b.p;
      const d = b.d + b.dd * Math.sin((TAU * t) / b.q + b.ph);
      return [Math.cos(a) * d, Math.sin(a) * d * 0.9, b.r, 1, 0];
    }),
  ],
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
