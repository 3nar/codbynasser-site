export const TAU = Math.PI * 2;

export const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smooth = (a: number, b: number, v: number) => {
  const t = clamp(0, 1, (v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
