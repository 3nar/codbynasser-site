import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from '@/config/site';

/**
 * The files Cloudflare serves or reads as they are, from public/: the headers sent with every response
 * (astro preview ignores _headers, so it is checked here), security.txt and robots.txt.
 */
const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const site = read('astro.config.mjs').match(/site: '([^']+)'/)![1];

/** the headers of the `/*` rule in public/_headers, by lower-case name */
function headersForEveryPage() {
  const lines = read('public/_headers').split(/\r?\n/);
  const headers = new Map<string, string>();
  for (const line of lines.slice(lines.indexOf('/*') + 1)) {
    if (!/^\s+\S/.test(line)) break;
    const at = line.indexOf(':');
    headers.set(line.slice(0, at).trim().toLowerCase(), line.slice(at + 1).trim());
  }
  return headers;
}

describe('public/_headers', () => {
  const headers = headersForEveryPage();

  it('keeps visitors on HTTPS for at least a year', () => {
    const maxAge = Number(headers.get('strict-transport-security')?.match(/max-age=(\d+)/)?.[1]);
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });

  it('lets no other site put the pages in a frame', () => {
    expect(headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(headers.get('x-frame-options')).toBe('DENY');
  });

  it('closes what the site never uses', () => {
    const csp = headers.get('content-security-policy');
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    const permissions = headers.get('permissions-policy');
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment'])
      expect(permissions).toContain(`${feature}=()`);
  });

  it('sends the rest of the usual set', () => {
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(headers.get('cross-origin-resource-policy')).toBe('same-origin');
  });
});

describe('public/.well-known/security.txt', () => {
  const fields = new Map(
    read('public/.well-known/security.txt')
      .split(/\r?\n/)
      .filter((l) => l.includes(':'))
      .map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()]),
  );

  it("names the site's email", () => {
    expect(fields.get('Contact')).toBe(`mailto:${SITE.contact.email}`);
  });

  it('sits at its own address on the site', () => {
    expect(fields.get('Canonical')).toBe(new URL('/.well-known/security.txt', site).href);
  });

  // RFC 9116: a file past its date is to be ignored; this fails a month ahead, so it gets renewed in time
  it('has an end date more than a month away, and at most a year', () => {
    const left = Date.parse(fields.get('Expires')!) - Date.now();
    const day = 86_400_000;
    expect(left).toBeGreaterThan(30 * day);
    expect(left).toBeLessThanOrEqual(366 * day);
  });
});

describe('public/robots.txt', () => {
  // groups of "User-agent" lines and the rules under them
  const groups = read('public/robots.txt')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.split(/\r?\n/).filter((l) => l && !l.startsWith('#')))
    .filter((lines) => lines.length);
  const rulesFor = (agent: string) =>
    groups.find((lines) => lines.some((l) => l.toLowerCase() === `user-agent: ${agent.toLowerCase()}`)) ?? [];

  it('lets every crawler read the site, AI answer engines included', () => {
    expect(rulesFor('*')).toContain('Allow: /');
    expect(rulesFor('*')).not.toContain('Disallow: /');
    for (const agent of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot']) expect(rulesFor(agent)).toEqual([]);
  });

  it('keeps Bytespider out', () => {
    expect(rulesFor('Bytespider')).toContain('Disallow: /');
  });
});
