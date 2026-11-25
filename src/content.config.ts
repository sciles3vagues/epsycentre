import { defineCollection } from 'astro:content';

import { publishedLoader } from '@/content/published-loader';
import { groupeSchema, teamMemberSchema } from '@/lib/content-schemas';

const team = defineCollection({ loader: publishedLoader('team'), schema: teamMemberSchema });

const groupes = defineCollection({ loader: publishedLoader('groupes'), schema: groupeSchema });

export const collections = { team, groupes };
