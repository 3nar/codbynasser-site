import { dirSign } from '@/scripts/dom';
import { clamp, smooth, TAU } from '@/scripts/math';
import { desktop, fine } from '@/scripts/media';
import { canAnimate } from '@/scripts/motion';

export interface LiquidShape {
  x: number;
  y: number;
  r: number;
  st?: number;
  a?: number;
}

export interface LiquidOptions {
  shapes(t: number, wide: boolean, uw: number, uh: number): LiquidShape[];
  mask(nx: number, ny: number, wide: boolean): number;
  blur(w: number): number;
  ink: number;
  ptr?: number;
  busy?(): boolean;
  step?(dt: number): void;
  layout?(rect: DOMRect): void;
  scale?(wide: boolean): number;
}

export interface LiquidLight {
  draw(): void;
}

const BG = [245, 245, 247];
const INK = [22, 22, 24];

export function createLiquidLight(cv: HTMLCanvasElement, o: LiquidOptions): LiquidLight {
  const aura = cv.parentElement!;
  const ctx = cv.getContext('2d')!;
  let W = 0;
  let H = 0;
  let R = 3;
  let img!: ImageData;
  let field!: Float32Array;
  let tmp!: Float32Array;
  let wide = true;
  const size = () => {
    const r = aura.getBoundingClientRect();
    wide = desktop.matches;
    const SCALE = o.scale ? o.scale(wide) : 12;
    W = Math.max(30, Math.round(r.width / SCALE));
    H = Math.max(30, Math.round(r.height / SCALE));
    cv.width = W;
    cv.height = H;
    img = ctx.createImageData(W, H);
    field = new Float32Array(W * H);
    tmp = new Float32Array(W * H);
    R = o.blur(W);
    if (o.layout) o.layout(cv.getBoundingClientRect());
  };
  const blurRows = (src: Float32Array, dst: Float32Array) => {
    const inv = 1 / (2 * R + 1);
    const last = W - 1;
    for (let y = 0, row = 0; y < H; y++, row += W) {
      let acc = 0;
      for (let i = -R; i <= R; i++) acc += src[row + (i < 0 ? 0 : i > last ? last : i)];
      for (let x = 0; x < W; x++) {
        dst[row + x] = acc * inv;
        const add = x + R + 1;
        const sub = x - R;
        acc += src[row + (add > last ? last : add)] - src[row + (sub < 0 ? 0 : sub)];
      }
    }
  };
  const blurCols = (src: Float32Array, dst: Float32Array) => {
    const inv = 1 / (2 * R + 1);
    const last = H - 1;
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let i = -R; i <= R; i++) acc += src[(i < 0 ? 0 : i > last ? last : i) * W + x];
      for (let y = 0; y < H; y++) {
        dst[y * W + x] = acc * inv;
        const add = y + R + 1;
        const sub = y - R;
        acc += src[(add > last ? last : add) * W + x] - src[(sub < 0 ? 0 : sub) * W + x];
      }
    }
  };
  const ptr = { x: 0.3, y: 0.5, vx: 0, vy: 0, tx: 0.3, ty: 0.5, r: 0, tr: 0 };
  const draw = (t: number) => {
    const unit = Math.min(W, H);
    const uw = W / unit;
    const uh = H / unit;
    const d = img.data;
    const P = o.shapes(t, wide, uw, uh).map((q) => ({
      x: q.x,
      y: q.y,
      c: Math.cos(q.a || 0),
      s: Math.sin(q.a || 0),
      st: q.st || 1,
      r2: q.r * q.r,
    }));
    if (ptr.r > 0.002) P.push({ x: ptr.x * uw, y: ptr.y * uh, c: 1, s: 0, st: 1, r2: ptr.r * ptr.r });
    let k = 0;
    for (let y = 0; y < H; y++) {
      const uy = y / unit;
      const ny = y / H;
      for (let x = 0; x < W; x++, k++) {
        const m = o.mask(x / W, ny, wide);
        if (m <= 0) {
          field[k] = 0;
          continue;
        }
        const ux = x / unit;
        let f = 0;
        for (const q of P) {
          const dx = ux - q.x;
          const dy = uy - q.y;
          const u = dx * q.c + dy * q.s;
          const w = dy * q.c - dx * q.s;
          f += q.r2 / ((u * u) / q.st + w * w * q.st + 1e-4);
        }
        field[k] = smooth(0.85, 1.25, f) * m;
      }
    }
    for (let i = 0; i < 3; i++) {
      blurRows(field, tmp);
      blurCols(tmp, field);
    }
    for (let i = 0, j = 0; i < field.length; i++, j += 4) {
      const v = clamp(0, 1, field[i]) * o.ink;
      d[j] = BG[0] + (INK[0] - BG[0]) * v;
      d[j + 1] = BG[1] + (INK[1] - BG[1]) * v;
      d[j + 2] = BG[2] + (INK[2] - BG[2]) * v;
      d[j + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  size();
  const T0 = 7;
  const start = performance.now();
  const clock = () => (canAnimate ? T0 + (performance.now() - start) / 1000 : T0);
  draw(T0);
  cv.classList.add('on');
  addEventListener('resize', () => {
    size();
    draw(clock());
  });
  const api = { draw: () => draw(clock()) };
  if (!canAnimate) return api;
  let raf = 0;
  let last = 0;
  let seen = true;
  const omega = TAU / 0.5;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const gap = now - last;
    if (gap < (o.busy && o.busy() ? 15 : 41)) return;
    const dt = Math.min(0.05, gap / 1000);
    last = now;
    ptr.vx += (omega * omega * (ptr.tx - ptr.x) - 2 * omega * ptr.vx) * dt;
    ptr.x += ptr.vx * dt;
    ptr.vy += (omega * omega * (ptr.ty - ptr.y) - 2 * omega * ptr.vy) * dt;
    ptr.y += ptr.vy * dt;
    ptr.r += (ptr.tr - ptr.r) * (1 - Math.exp(-dt / 0.35));
    if (o.step) o.step(dt);
    draw(T0 + (now - start) / 1000);
  };
  if (fine.matches) {
    const host = aura.closest('section') || aura;
    host.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      ptr.tx = (dirSign > 0 ? e.clientX - r.left : r.right - e.clientX) / r.width;
      ptr.ty = (e.clientY - r.top) / r.height;
      if (ptr.tr === 0) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
        ptr.vx = ptr.vy = 0;
      }
      ptr.tr = o.ptr || 0.07;
    });
    host.addEventListener('pointerleave', () => {
      ptr.tr = 0;
    });
  }
  const run = () => {
    if (!raf && seen && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const halt = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  new IntersectionObserver(([e]) => {
    seen = e.isIntersecting;
    if (seen) run();
    else halt();
  }).observe(aura);
  document.addEventListener('visibilitychange', () => (document.hidden ? halt() : run()));
  run();
  return api;
}
