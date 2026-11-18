import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SERVICE_IDS } from '@/config/routes';

const serviceId = z.enum(SERVICE_IDS);

const services = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/services' }),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    shortName: z.string(),
    summary: z.string(),
    meta: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({
      tone: z.enum(['light', 'dark']),
      surface: z.string().default(''),
      shape: z.enum(['content', 'ai', 'software']),
      title: z.string(),
      say: z.string(),
      cta: z.string(),
    }),
    door: z.object({
      title: z.string(),
      say: z.string(),
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
          name: z.string(),
          screen: z.enum(['plan', 'week', 'feed', 'chat', 'chart', 'docs', 'study', 'prototype', 'store']).optional(),
        }),
      )
      .min(1),
    goal: z.tuple([z.string(), z.string()]),
    next: serviceId,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/projects' }),
  schema: z.object({
    group: z.enum(['featured', 'ai', 'systems']),
    order: z.number().int().positive(),
    title: z.string(),
    shortTitle: z.string().min(1),
    kind: z.string(),
    summary: z.string(),
    tools: z.array(z.string()).default([]),
    feature: z
      .object({ badge: z.string(), live: z.boolean().default(false), flip: z.boolean().default(false) })
      .optional(),
    mini: z.object({ light: z.boolean().default(false), a: z.string(), b: z.string(), c: z.string() }).optional(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/skills' }),
  schema: z.object({
    groups: z.array(z.object({ title: z.string(), items: z.array(z.string()).min(1) })).min(1),
  }),
});

const joinFields = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/join-fields' }),
  schema: z.object({
    fields: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
  }),
});

export const collections = { services, projects, skills, joinFields };
