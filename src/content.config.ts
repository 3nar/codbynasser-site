/**
 * The site's structured content, one folder per collection and one folder per language inside it
 * (src/content/<collection>/<locale>/…). Each entry is checked against its schema at build time, so a missing
 * or misspelt field stops the build instead of reaching a page.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SERVICE_IDS } from '@/config/routes';

const serviceId = z.enum(SERVICE_IDS);

/** The three services: their page, their door on the home page, and how menus name them. */
const services = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/services' }),
  schema: z.object({
    order: z.number().int().positive(),
    /** the service's name in menus, the footer, the request form and the home page's switch */
    name: z.string(),
    /** the shorter name in the switch at the top of a service page */
    shortName: z.string(),
    /** one line on the about page («ما أعمله») */
    summary: z.string(),
    meta: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({
      tone: z.enum(['light', 'dark']),
      /** the aura's surface classes: light, light dots, grid; left out on a dark hero, whose aura has none */
      surface: z.string().default(''),
      /** the aura's shape, also the figure the liquid light takes behind the door */
      shape: z.enum(['content', 'ai', 'software']),
      title: z.string(),
      say: z.string(),
      cta: z.string(),
    }),
    door: z.object({
      title: z.string(),
      say: z.string(),
      /** short forms of the problems, each a link to its fix */
      questions: z.array(z.string()).min(1),
      cta: z.string(),
    }),
    problems: z
      .array(
        z.object({
          question: z.string(),
          why: z.string(),
          fix: z.string(),
          includes: z.array(z.string()).min(1),
          /** the fix's name in the menu and under the sticky phone */
          name: z.string(),
          /** the phone's drawing for this fix (FixPhone/screens); without one the phone lists what it includes */
          screen: z.enum(['plan', 'week', 'feed', 'chat', 'chart', 'docs', 'study', 'prototype', 'store']).optional(),
        }),
      )
      .min(1),
    /** the goal line: the first part is set apart */
    goal: z.tuple([z.string(), z.string()]),
    /** the service the page leads to next */
    next: serviceId,
  }),
});

/** The works on the projects page: two told at length, the rest in an index of two groups. */
const projects = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/projects' }),
  schema: z.object({
    group: z.enum(['featured', 'ai', 'systems']),
    order: z.number().int().positive(),
    title: z.string(),
    /** the name a request message gives it («مشروع مشابه: …»), when a link comes from this project */
    shortTitle: z.string().min(1),
    kind: z.string(),
    /** may hold <bdi> around Latin product names */
    summary: z.string(),
    tools: z.array(z.string()).default([]),
    /** featured works: the badge, whether it is running now, and which side the illustration takes */
    feature: z
      .object({ badge: z.string(), live: z.boolean().default(false), flip: z.boolean().default(false) })
      .optional(),
    /** index rows: the small aura's three points of light */
    mini: z.object({ light: z.boolean().default(false), a: z.string(), b: z.string(), c: z.string() }).optional(),
  }),
});

/** The about page's skills, grouped by field; one file per language. */
const skills = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/skills' }),
  schema: z.object({
    groups: z.array(z.object({ title: z.string(), items: z.array(z.string()).min(1) })).min(1),
  }),
});

/** The fields «اعمل معي» needs collaborators in; the application form offers the same list. */
const joinFields = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/join-fields' }),
  schema: z.object({
    fields: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
  }),
});

export const collections = { services, projects, skills, joinFields };
