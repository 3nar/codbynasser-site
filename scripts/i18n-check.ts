/**
 * Language parity check (npm run i18n:check, run before every build).
 * Arabic is the reference. Every other language must have:
 *   - the same interface texts: src/i18n/ui/<locale>/<namespace>.json, key for key (lists item for item);
 *   - the same content entries: src/content/<collection>/<locale>/<id>.json, or src/content/<collection>/<locale>.json,
 *     each with the same fields.
 * A missing key or entry, or an empty text, fails the check; an extra key is only reported.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const UI = join(SRC, 'i18n', 'ui');
const CONTENT = join(SRC, 'content');
const REFERENCE = 'ar';

type Flat = Map<string, unknown>;

/** every leaf of a JSON value by its dotted path; list items by index, so lists must match in length too */
function flatten(value: unknown, prefix: string, out: Flat = new Map()): Flat {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else {
    out.set(prefix, value);
  }
  return out;
}

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const jsonFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : []);
const dirs = (dir: string) => readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory());

/** all texts of one language: interface texts, then each content entry */
function load(locale: string): Flat {
  const flat: Flat = new Map();
  for (const file of jsonFiles(join(UI, locale)))
    flatten(readJson(join(UI, locale, file)), `ui.${file.slice(0, -5)}`, flat);
  for (const collection of dirs(CONTENT)) {
    const base = join(CONTENT, collection);
    const single = join(base, `${locale}.json`);
    if (existsSync(single)) flatten(readJson(single), `content.${collection}`, flat);
    for (const file of jsonFiles(join(base, locale))) {
      flatten(readJson(join(base, locale, file)), `content.${collection}.${file.slice(0, -5)}`, flat);
    }
  }
  return flat;
}

const reference = load(REFERENCE);
const locales = [...new Set([...dirs(UI), ...dirs(CONTENT).flatMap((c) => dirs(join(CONTENT, c)))])];
let failed = false;

for (const locale of locales.sort((a, b) => (a === REFERENCE ? -1 : b === REFERENCE ? 1 : a.localeCompare(b)))) {
  const texts = load(locale);
  const missing = [...reference.keys()].filter((key) => !texts.has(key));
  const extra = [...texts.keys()].filter((key) => !reference.has(key));
  const empty = [...texts].filter(([, value]) => value === '' || value == null).map(([key]) => key);
  const bad = missing.length > 0 || empty.length > 0;
  failed ||= bad;
  console.log(`${bad ? '✗' : '✓'} ${locale}: ${texts.size} texts`);
  for (const key of missing) console.log(`   missing  ${key}`);
  for (const key of empty) console.log(`   empty    ${key}`);
  for (const key of extra) console.log(`   extra    ${key}`);
}

if (failed) {
  console.error('\ni18n check failed: add the missing texts before building.');
  process.exit(1);
}
