/**
 * What a request link already chose, read from its query (made by requestFor() in @/config/routes):
 *   ?s=ai           the service
 *   ?s=ai&p=2       the service and its second problem
 *   ?project=<id>   a similar project
 * Anything the catalogue does not know is ignored. A problem wins over a project when a link has both.
 */
export interface PrefillCatalogue {
  /** the services the form offers, by value */
  services: readonly string[];
  /** each service's problems in page order: p=1 is the first */
  problems: Readonly<Record<string, readonly string[]>>;
  /** each project's name for a request, by id */
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
