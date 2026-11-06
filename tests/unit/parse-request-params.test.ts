import { describe, expect, it } from 'vitest';
import { parseRequestParams, type PrefillCatalogue } from '@/lib/prefill/parse-request-params';

const catalogue: PrefillCatalogue = {
  services: ['accounts', 'ai', 'software', 'unsure'],
  problems: { ai: ['first problem', 'second problem'], accounts: ['an accounts problem'] },
  projects: { tutubot: 'TutuBot', empty: '' },
};
const read = (query: string) => parseRequestParams(query, catalogue);

describe('a request link', () => {
  it('chooses the service and names its problem', () => {
    expect(read('?s=ai&p=2')).toEqual({ service: 'ai', context: { kind: 'problem', text: 'second problem' } });
  });

  it('chooses the service alone', () => {
    expect(read('?s=unsure')).toEqual({ service: 'unsure', context: null });
  });

  it('names a similar project', () => {
    expect(read('?project=tutubot')).toEqual({ service: null, context: { kind: 'project', text: 'TutuBot' } });
  });

  it('prefers the problem when it names both', () => {
    expect(read('?s=ai&p=1&project=tutubot').context).toEqual({ kind: 'problem', text: 'first problem' });
  });

  it('ignores a problem number that is not one of the service’s problems', () => {
    for (const p of ['0', '-1', '3', '1.5', 'x', ''])
      expect(read(`?s=ai&p=${p}`)).toEqual({ service: 'ai', context: null });
  });

  it('ignores what the catalogue does not know, prototype names included', () => {
    expect(read('?s=nope&p=1&project=nope')).toEqual({ service: null, context: null });
    expect(read('?s=__proto__&p=1&project=constructor')).toEqual({ service: null, context: null });
    expect(read('?s=toString&project=hasOwnProperty')).toEqual({ service: null, context: null });
  });

  it('shows no note for a project without a name', () => {
    expect(read('?project=empty').context).toBeNull();
  });

  it('reads URLSearchParams as well as a query string', () => {
    expect(parseRequestParams(new URLSearchParams('s=accounts&p=1'), catalogue)).toEqual({
      service: 'accounts',
      context: { kind: 'problem', text: 'an accounts problem' },
    });
  });
});
