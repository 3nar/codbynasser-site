/**
 * Brings the site's fonts home: downloads the files Google Fonts serves for the two stylesheets below into
 * src/assets/fonts/, and writes src/styles/fonts.css with the same @font-face rules pointing at them. The pages
 * then load nothing from another site, and the Content-Security-Policy allows fonts from this site only.
 * The rules stay Google's own, script by script (unicode-range), so a browser still fetches only the files a page
 * needs, and the type looks exactly as it did when it came from Google.
 * Run it after changing a family, a weight or an axis: npm run fonts
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = join(ROOT, 'src/assets/fonts');
const CSS = join(ROOT, 'src/styles/fonts.css');

/** Arabic pages: Tajawal and IBM Plex Sans Arabic; English and Russian: Onest and Source Serif 4 (styles/type-latin.css) */
const STYLESHEETS = [
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Onest:wght@400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..600;1,8..60,300..600&display=swap',
];

// Google writes the stylesheet for the browser that asks; a current Chrome gets woff2 files split by script
const BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

async function get(url: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': BROWSER }, signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      if (attempt === 3) throw new Error(`could not fetch ${url}`, { cause: error });
    }
  }
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const descriptor = (block: string, name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? '';

// one @font-face per script, each after a comment naming it: /* arabic */ @font-face { ... }
const FACE = /\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]*)\}/g;

await mkdir(FILES, { recursive: true });
for (const old of await readdir(FILES)) if (old.endsWith('.woff2')) await rm(join(FILES, old));

const faces: string[] = [];
const names = new Set<string>();
for (const stylesheet of STYLESHEETS) {
  const css = await (await get(stylesheet)).text();
  for (const [, subset, body] of css.matchAll(FACE)) {
    const url = body.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1];
    if (!url) throw new Error(`no woff2 file in the ${subset} face of ${stylesheet}`);
    const family = descriptor(body, 'font-family').replace(/'/g, '');
    const name = [slug(family), descriptor(body, 'font-style'), slug(descriptor(body, 'font-weight')), subset]
      .join('-')
      .concat('.woff2');
    if (names.has(name)) throw new Error(`two faces would share ${name}`);
    names.add(name);
    await writeFile(join(FILES, name), Buffer.from(await (await get(url)).arrayBuffer()));
    faces.push(`/* ${subset} */\n@font-face {${body.replace(url, `'../assets/fonts/${name}'`)}}`);
  }
}

await writeFile(
  CSS,
  [
    '/*',
    ' * The four families, served from this site: written by scripts/fonts.ts from Google Fonts (npm run fonts).',
    ' * Do not edit by hand; change the stylesheets in the script and run it again.',
    ' * The fonts are under the SIL Open Font License 1.1 (src/assets/fonts/README.md).',
    ' */',
    ...faces,
    '',
  ].join('\n'),
);
console.log(`${faces.length} faces, ${names.size} files in src/assets/fonts/`);
