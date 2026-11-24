import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const team = defineCollection({
  loader: file('src/content/team.json'),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    jobTitle: z.string(),
    description: z.string(),
    publics: z.string(),
    problematiques: z.string(),
    modalites: z.string(),
    rdv: z.array(
      z.object({
        type: z.enum(['phone', 'email', 'url']),
        label: z.string(),
        value: z.string(),
      })
    ),
  }),
});

export const collections = { team };
