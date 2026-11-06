/**
 * «اعمل معي»: the liquid light drifts very slowly, and each shape keeps its own long periods, so the pattern
 * never repeats in a beat the eye can catch. The words stay clear of it.
 */
import { createLiquidLight } from '@/components/effects/LiquidLight/liquid-light';
import { $$ } from '@/scripts/dom';
import { clamp, smooth, TAU } from '@/scripts/math';

// per shape: resting centre (0–1 of the area), drift, size, stretch, and three periods in seconds (one full cycle
// each). The periods share no common beat
const FLOW = [
  { x: 0.22, y: 0.42, ax: 0.06, ay: 0.08, r: 0.15, st: 1.8, p: [19, 23, 29], ph: 0 },
  { x: 0.36, y: 0.68, ax: 0.06, ay: 0.06, r: 0.11, st: 2.4, p: [17, 29, 31], ph: 1.7 },
  { x: 0.08, y: 0.7, ax: 0.05, ay: 0.06, r: 0.09, st: 1.5, p: [23, 13, 37], ph: 3.1 },
  { x: 0.4, y: 0.24, ax: 0.05, ay: 0.06, r: 0.08, st: 2.8, p: [13, 21, 27], ph: 4.4 },
  { x: 0.12, y: 0.24, ax: 0.05, ay: 0.05, r: 0.09, st: 1.3, p: [29, 17, 23], ph: 5.9 },
];

export function initJoinHero() {
  // every liquid light but the doors' one
  $$<HTMLCanvasElement>('.aura.flow:not(#pillarAura) > canvas').forEach((cv) =>
    createLiquidLight(cv, {
      // about 40 screen pixels on a wide screen
      blur: (w) => clamp(2, 4, Math.round(w * 0.021)),
      ink: 0.94,
      shapes: (t, wide, uw, uh) =>
        FLOW.map((b) => {
          // on phones the words sit below the light, so the shapes gather in a band at the top
          const cx = (wide ? b.x : b.x * 1.5 + 0.05) + b.ax * Math.sin((TAU * t) / b.p[0] + b.ph);
          const cy = (wide ? b.y : 0.06 + b.y * 0.34) + b.ay * Math.sin((TAU * t) / b.p[1] + b.ph * 1.3);
          return {
            x: cx * uw,
            y: cy * uh,
            r: b.r,
            st: 1 + (b.st - 1) * (0.65 + 0.35 * Math.sin(((TAU * t) / b.p[2]) * 1.7 + b.ph)),
            a: 0.7 * Math.sin((TAU * t) / b.p[2] + b.ph),
          };
        }),
      // the words stay clear: the light fades out before the copy column, or above the copy on phones
      mask: (nx, ny, wide) => (wide ? 1 - smooth(0.4, 0.66, nx) : 1 - smooth(0.28, 0.46, ny)),
    }),
  );
}
