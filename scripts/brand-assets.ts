import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';
import { ICONS } from '../src/components/ui/Icon/icons.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

const INK = '#000000';
const PAPER = '#ffffff';

const wordmark = (color: string) =>
  ICONS.logo
    .replace(' aria-hidden="true"', '')
    .replace('fill="currentColor"', `fill="${color}"`)
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');

const C_PATH =
  'M263 0C401 0 487 70 503 208L350 208C333 166 311 145 263 145C187 145 157 208 157 276C157 339 192 401 262 401C310 401 333 380 351 338L508 338C505 364 502 390 491 415C452 505 351 545 258 545C96 545 0 434 0 275C0 115 98 0 263 0Z';
const icon = (rounded: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect width="1000" height="1000"${rounded ? ' rx="220"' : ''} fill="${INK}"/><path fill="${PAPER}" transform="translate(264 228) scale(1)" d="${C_PATH}"/></svg>`;

const FONTS =
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;800&family=Onest:wght@800&family=Source+Serif+4:opsz,wght@8..60,300&display=swap';

const dataUri = async (file: string) =>
  `data:image/webp;base64,${(await readFile(join(ROOT, file))).toString('base64')}`;

async function shot(
  page: Page,
  width: number,
  height: number,
  body: string,
  type: 'png' | 'jpeg' = 'png',
  omitBackground = false,
) {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>*{margin:0;box-sizing:border-box}html,body{width:${width}px;height:${height}px;overflow:hidden;background:transparent}svg{display:block}</style>${body}`,
    { waitUntil: 'networkidle' },
  );
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ type, omitBackground, ...(type === 'jpeg' ? { quality: 86 } : {}) });
}

function toIco(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

function shareImage(lang: 'ar' | 'en' | 'ru', man: string, ghost: string, line: string) {
  const rtl = lang === 'ar';
  const font = rtl
    ? 'font-family:Tajawal;font-weight:300;font-size:38px;line-height:1.45'
    : "font-family:'Source Serif 4';font-weight:300;font-size:36px;line-height:1.28;letter-spacing:-.012em";
  const flip = rtl ? '' : 'transform:scaleX(-1);';
  const photo = `position:absolute;inset-block:0;${rtl ? 'left:-150px' : 'right:-150px'};height:630px;width:1120px;${flip}mix-blend-mode:multiply`;
  return `<main dir="${rtl ? 'rtl' : 'ltr'}" lang="${lang}" style="position:relative;width:1200px;height:630px;background:${PAPER};overflow:hidden;color:${INK}">
    <img src="${ghost}" alt="" style="${photo}"><img src="${man}" alt="" style="${photo}">
    <div style="position:absolute;inset-block:0;inset-inline-start:72px;width:400px;display:flex;flex-direction:column;justify-content:center;gap:34px">
      <div style="width:264px" dir="ltr">${wordmark(INK)}</div>
      <p style="${font}">${line}</p>
    </div>
  </main>`;
}

const LINES = {
  ar: 'تبقى الفكرة طيفاً، حتى تصير كوداً.',
  en: 'An idea stays a ghost until it becomes code.',
  ru: 'Идея остаётся призраком, пока не станет кодом.',
} as const;

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
try {
  await Promise.all(['og', ''].map((dir) => mkdir(join(PUBLIC, dir), { recursive: true })));

  await writeFile(join(PUBLIC, 'favicon.svg'), icon(true));
  const rendered = (size: number, rounded: boolean) => shot(page, size, size, icon(rounded), 'png', rounded);
  const [i16, i32] = [await rendered(16, true), await rendered(32, true)];
  await writeFile(
    join(PUBLIC, 'favicon.ico'),
    toIco([
      { size: 16, png: i16 },
      { size: 32, png: i32 },
    ]),
  );
  await writeFile(join(PUBLIC, 'apple-touch-icon.png'), await rendered(180, false));
  await writeFile(join(PUBLIC, 'icon-192.png'), await rendered(192, false));
  await writeFile(join(PUBLIC, 'icon-512.png'), await rendered(512, false));
  await writeFile(
    join(PUBLIC, 'site.webmanifest'),
    `${JSON.stringify(
      {
        name: 'cod by nasser',
        short_name: 'cod',
        start_url: './',
        display: 'browser',
        background_color: PAPER,
        theme_color: PAPER,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const [man, ghost] = await Promise.all(['src/assets/images/man.webp', 'src/assets/images/ghost.webp'].map(dataUri));
  for (const lang of ['ar', 'en', 'ru'] as const) {
    await writeFile(
      join(PUBLIC, `og/${lang}.jpg`),
      await shot(page, 1200, 630, shareImage(lang, man, ghost, LINES[lang]), 'jpeg'),
    );
  }
} finally {
  await browser.close();
}
