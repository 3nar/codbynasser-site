/** The small maths the scenes share. */

export const TAU = Math.PI * 2;

/** v held between min and max */
export const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));

/** the point t (0–1) of the way from a to b */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 up to a, 1 from b, and a smooth S-curve between (smoothstep) */
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp(0, 1, (v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
