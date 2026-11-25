import { z } from 'astro/zod';

const text = (max: number) => z.string().trim().min(1).max(max);

/** Key of a photo stored in Blobs (random UUID), served by `/media/<key>`. */
export const photoKeySchema = z.uuid();

const rdvSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('phone'),
    label: text(60),
    value: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 .-]{5,19}$/),
  }),
  z.object({ type: z.literal('email'), label: text(120), value: z.email() }),
  z.object({ type: z.literal('url'), label: text(120), value: z.url({ protocol: /^https$/ }) }),
]);

export const teamMemberSchema = z.object({
  order: z.number().int(),
  name: text(100),
  jobTitle: text(100),
  description: text(1000),
  publics: text(2000),
  problematiques: text(2000),
  modalites: text(2000),
  rdv: z.array(rdvSchema).max(5),
  photo: photoKeySchema.optional(),
});

export const groupeSchema = z.object({
  order: z.number().int(),
  name: text(100),
  description: text(2000),
});

/** Collections editable in the back office, with the public slug of their published JSON (`/contenu/<slug>.json`). */
export const PUBLISHED_SLUGS = {
  team: 'equipe',
  groupes: 'groupes',
} as const;

export type PublishedCollection = keyof typeof PUBLISHED_SLUGS;

export const PUBLISHED_COLLECTIONS = Object.keys(PUBLISHED_SLUGS) as PublishedCollection[];

export const collectionFromSlug = (slug: string | undefined): PublishedCollection | undefined =>
  PUBLISHED_COLLECTIONS.find(collection => PUBLISHED_SLUGS[collection] === slug);

const idSchema = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/** Stored entries (drafts and published): content + id. `order` follows the list position. */
export const teamEntrySchema = teamMemberSchema.extend({ id: idSchema });
export const groupeEntrySchema = groupeSchema.extend({ id: idSchema });

export type TeamEntry = z.infer<typeof teamEntrySchema>;
export type GroupeEntry = z.infer<typeof groupeEntrySchema>;

const hasUniqueIds = (entries: { id: string }[]): boolean =>
  new Set(entries.map(({ id }) => id)).size === entries.length;

/** What the back office sends: the full list in display order (the server sets `order`). */
export const teamInputSchema = z
  .array(teamEntrySchema.omit({ order: true }))
  .max(50)
  .refine(hasUniqueIds, 'Deux membres ont le même identifiant.');
export const groupesInputSchema = z
  .array(groupeEntrySchema.omit({ order: true }))
  .max(50)
  .refine(hasUniqueIds, 'Deux groupes ont le même identifiant.');
