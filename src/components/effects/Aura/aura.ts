/**
 * The aura's three soft shapes. Each named shape places them, in vw and vh from the centre; a scene can blend
 * one shape into another as the page scrolls (the question, the close).
 */
import { $$, dirSign } from '@/scripts/dom';
import { lerp } from '@/scripts/math';
import { desktop } from '@/scripts/media';

/** per blob: x, y, scale x, scale y, opacity, rotation in degrees */
type Shape = number[][];

// "d" is for wide screens, "m" for phones, where the words sit below.
// content: one round shape and two small ones, like a profile and its bubbles; ai: a diagonal ribbon;
// software: stacked bars, like a layout
const SHAPES = {
  content: {
    d: [
      [-26, 6, 1.15, 1.1, 0.95, 0],
      [-6, -26, 0.42, 0.42, 0.85, 0],
      [-46, 32, 0.32, 0.32, 0.75, 0],
    ],
    m: [
      [-4, -22, 0.85, 0.8, 0.9, 0],
      [24, -36, 0.35, 0.35, 0.8, 0],
      [-26, -8, 0.28, 0.28, 0.7, 0],
    ],
  },
  ai: {
    d: [
      [-36, -18, 0.9, 0.42, 0.9, -32],
      [-22, 2, 0.95, 0.46, 0.95, -28],
      [-8, 22, 0.8, 0.4, 0.85, -34],
    ],
    m: [
      [-28, -33, 0.55, 0.28, 0.85, -30],
      [0, -24, 0.6, 0.3, 0.9, -26],
      [28, -15, 0.5, 0.26, 0.8, -32],
    ],
  },
  software: {
    d: [
      [-27, -20, 0.95, 0.3, 0.9, 0],
      [-27, 0, 1.1, 0.38, 0.95, 0],
      [-27, 20, 0.95, 0.3, 0.9, 0],
    ],
    m: [
      [0, -34, 0.9, 0.22, 0.85, 0],
      [0, -24, 1, 0.28, 0.9, 0],
      [0, -14, 0.9, 0.22, 0.85, 0],
    ],
  },
  gather: {
    d: [
      [0, 22, 1, 0.7, 0.95, 0],
      [-10, 16, 0.7, 0.6, 0.85, 0],
      [11, 26, 0.65, 0.5, 0.85, 0],
    ],
    m: [
      [0, 22, 1, 0.7, 0.95, 0],
      [-14, 16, 0.7, 0.6, 0.85, 0],
      [14, 26, 0.65, 0.5, 0.85, 0],
    ],
  },
  scatter: {
    d: [
      [-46, -34, 0.5, 0.5, 0.25, 0],
      [44, -30, 0.45, 0.45, 0.2, 0],
      [6, 46, 0.5, 0.4, 0.2, 0],
    ],
    m: [
      [-40, -40, 0.5, 0.5, 0.25, 0],
      [40, -36, 0.45, 0.45, 0.2, 0],
      [0, 46, 0.5, 0.4, 0.2, 0],
    ],
  },
  // projects: a body of work, one large and two small
  works: {
    d: [
      [-30, -6, 0.7, 0.7, 0.9, 0],
      [-12, 20, 0.42, 0.42, 0.8, 0],
      [-42, 26, 0.32, 0.32, 0.7, 0],
    ],
    m: [
      [-10, -28, 0.6, 0.6, 0.9, 0],
      [22, -16, 0.32, 0.32, 0.8, 0],
      [-26, -12, 0.26, 0.26, 0.7, 0],
    ],
  },
} satisfies Record<string, { d: Shape; m: Shape }>;

export type ShapeName = keyof typeof SHAPES;

const shapeOf = (name: ShapeName): Shape => SHAPES[name][desktop.matches ? 'd' : 'm'];

// a shape is written straight into each blob's custom properties; the scenes that move it call this every frame.
// Shapes are drawn for Arabic, with the light opposite the words; left-to-right pages mirror them
const setShape = (aura: HTMLElement, shape: Shape) =>
  $$('.blob', aura).forEach((el, i) => {
    const [x, y, sx, sy, o, r] = shape[i];
    el.style.setProperty('--x', `${x * dirSign}vw`);
    el.style.setProperty('--y', `${y}vh`);
    el.style.setProperty('--sx', String(sx));
    el.style.setProperty('--sy', String(sy));
    el.style.setProperty('--r', `${r * dirSign}deg`);
    el.style.opacity = String(o);
  });

/** the aura at the point t (0–1) of the way from one shape to another */
export const blendShape = (aura: HTMLElement, from: ShapeName, to: ShapeName, t: number) => {
  const a = shapeOf(from);
  const b = shapeOf(to);
  setShape(
    aura,
    a.map((p, i) => p.map((v, k) => lerp(v, b[i][k], t))),
  );
};

/** every aura takes its named shape */
export function initAuras() {
  $$('.aura[data-shape]').forEach((aura) => setShape(aura, shapeOf(aura.dataset.shape as ShapeName)));
}
