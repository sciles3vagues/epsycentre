import { defineCollection } from 'astro:content';

import groupesFixtures from '@/content/fixtures/groupes.json';
import teamFixtures from '@/content/fixtures/team.json';
import { publishedLoader } from '@/content/published-loader';
import { groupeSchema, teamMemberSchema } from '@/lib/content-schemas';

const team = defineCollection({
  loader: publishedLoader({ collection: 'team', fixtures: teamFixtures }),
  schema: teamMemberSchema,
});

const groupes = defineCollection({
  loader: publishedLoader({ collection: 'groupes', fixtures: groupesFixtures }),
  schema: groupeSchema,
});

export const collections = { team, groupes };
