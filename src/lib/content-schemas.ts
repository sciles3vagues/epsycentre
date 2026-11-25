import { z } from 'astro/zod';

export const teamMemberSchema = z.object({
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
});

export const groupeSchema = z.object({
  order: z.number(),
  name: z.string(),
  description: z.string(),
});

/** Collections editable in the back office, with the public slug of their published JSON (`/contenu/<slug>.json`). */
export const PUBLISHED_SLUGS = {
  team: 'equipe',
  groupes: 'groupes',
} as const;

export type PublishedCollection = keyof typeof PUBLISHED_SLUGS;

export const collectionFromSlug = (slug: string | undefined): PublishedCollection | undefined =>
  (Object.keys(PUBLISHED_SLUGS) as PublishedCollection[]).find(collection => PUBLISHED_SLUGS[collection] === slug);
