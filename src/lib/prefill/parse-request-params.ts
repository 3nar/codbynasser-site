export interface PrefillCatalogue {
  services: readonly string[];
  problems: Readonly<Record<string, readonly string[]>>;
  projects: Readonly<Record<string, string>>;
}

export interface RequestPrefill {
  service: string | null;
  context: { kind: 'problem' | 'project'; text: string } | null;
}

export function parseRequestParams(query: string | URLSearchParams, catalogue: PrefillCatalogue): RequestPrefill {
  const q = typeof query === 'string' ? new URLSearchParams(query) : query;
  const s = q.get('s') ?? '';
  const p = Number(q.get('p'));
  const project = q.get('project') ?? '';
  const service = catalogue.services.includes(s) ? s : null;
  const problems = Object.hasOwn(catalogue.problems, s) ? catalogue.problems[s] : [];
  const problem = Number.isInteger(p) && p >= 1 ? problems[p - 1] : undefined;
  const work = Object.hasOwn(catalogue.projects, project) ? catalogue.projects[project] : undefined;
  if (problem) return { service, context: { kind: 'problem', text: problem } };
  if (work) return { service, context: { kind: 'project', text: work } };
  return { service, context: null };
}
