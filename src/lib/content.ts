/**
 * Read the content collections for one language, in display order, with the language taken off the ids
 * (ar/accounts → accounts). A language without its own entries falls back to the default one.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, toLocale } from '@/i18n/config';
import type { ServiceId } from '@/config/routes';

type Localised = 'services' | 'projects';

async function entriesFor<C extends Localised>(collection: C, locale?: string) {
  const want = async (lang: string) =>
    (await getCollection(collection)).filter((entry: CollectionEntry<C>) => entry.id.startsWith(`${lang}/`));
  const current = toLocale(locale);
  const entries = await want(current);
  return entries.length || current === DEFAULT_LOCALE ? entries : want(DEFAULT_LOCALE);
}

const slug = (id: string) => id.slice(id.indexOf('/') + 1);

export type Service = CollectionEntry<'services'>['data'] & { id: ServiceId };

export async function getServices(locale?: string): Promise<Service[]> {
  return (await entriesFor('services', locale))
    .map((entry) => ({ ...entry.data, id: slug(entry.id) as ServiceId }))
    .sort((a, b) => a.order - b.order);
}

export type Project = CollectionEntry<'projects'>['data'] & { id: string };

export async function getProjects(locale?: string): Promise<Project[]> {
  return (await entriesFor('projects', locale))
    .map((entry) => ({ ...entry.data, id: slug(entry.id) }))
    .sort((a, b) => a.order - b.order);
}

/** a collection that keeps one file per language (skills/ar.json) */
async function single<C extends 'skills' | 'joinFields'>(collection: C, locale?: string) {
  const all = await getCollection(collection);
  const pick = (lang: string) => all.find((entry: CollectionEntry<C>) => entry.id === lang);
  const entry = pick(toLocale(locale)) ?? pick(DEFAULT_LOCALE);
  if (!entry) throw new Error(`No ${collection} content for ${DEFAULT_LOCALE}`);
  return entry.data as CollectionEntry<C>['data'];
}

export const getSkills = async (locale?: string) => (await single('skills', locale)).groups;
export const getJoinFields = async (locale?: string) => (await single('joinFields', locale)).fields;
