import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

import { requireAdmin } from '@/actions/admin/guard';
import { groupeEntrySchema, groupesInputSchema, teamEntrySchema, teamInputSchema } from '@/lib/content-schemas';
import {
  discardDrafts as clearDrafts,
  hasDrafts,
  publishDrafts,
  readEntries,
  readPublishedAt,
  writeDraft,
} from '@/lib/content-store';
import { deletePhotosExcept, detectImageType, savePhoto } from '@/lib/photo-store';
import { triggerRebuild } from '@/lib/rebuild';

import type { TeamEntry } from '@/lib/content-schemas';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const teamListSchema = z.array(teamEntrySchema);
const groupesListSchema = z.array(groupeEntrySchema);

const withOrder = <T extends object>(entries: T[]): (T & { order: number })[] =>
  entries.map((entry, index) => ({ ...entry, order: index + 1 }));

/** The draft when there is one, otherwise the published version. */
const draftTeam = async () =>
  teamListSchema.parse((await readEntries('draft', 'team')) ?? (await readEntries('published', 'team')) ?? []);
const draftGroupes = async () =>
  groupesListSchema.parse((await readEntries('draft', 'groupes')) ?? (await readEntries('published', 'groupes')) ?? []);
const publishedTeam = async () => teamListSchema.parse((await readEntries('published', 'team')) ?? []);

const photoKeys = (entries: TeamEntry[]): string[] =>
  entries.flatMap(({ photo }) => (photo === undefined ? [] : [photo]));

export const getDrafts = defineAction({
  handler: async (_input, context) => {
    await requireAdmin(context);
    return {
      team: await draftTeam(),
      groupes: await draftGroupes(),
      hasUnpublishedChanges: await hasDrafts(),
      publishedAt: await readPublishedAt(),
    };
  },
});

export const saveTeam = defineAction({
  accept: 'json',
  input: z.object({ entries: teamInputSchema }),
  handler: async ({ entries }, context) => {
    await requireAdmin(context);
    await writeDraft('team', withOrder(entries));
  },
});

export const saveGroupes = defineAction({
  accept: 'json',
  input: z.object({ entries: groupesInputSchema }),
  handler: async ({ entries }, context) => {
    await requireAdmin(context);
    await writeDraft('groupes', withOrder(entries));
  },
});

export const uploadPhoto = defineAction({
  accept: 'form',
  input: z.object({ photo: z.instanceof(File) }),
  handler: async ({ photo }, context) => {
    await requireAdmin(context);
    if (photo.size > MAX_PHOTO_BYTES) {
      throw new ActionError({ code: 'CONTENT_TOO_LARGE', message: 'La photo dépasse 5 Mo.' });
    }
    const data = await photo.arrayBuffer();
    const contentType = detectImageType(new Uint8Array(data, 0, Math.min(12, data.byteLength)));
    if (contentType === null) {
      throw new ActionError({ code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Format accepté : JPEG, PNG ou WebP.' });
    }
    return { key: await savePhoto(data, contentType) };
  },
});

export const publish = defineAction({
  handler: async (_input, context) => {
    await requireAdmin(context);
    const previous = await publishedTeam();
    await publishDrafts();
    // Keep the photos of the version still online until the rebuild is live.
    const keep = new Set([...photoKeys(previous), ...photoKeys(await publishedTeam())]);
    await deletePhotosExcept(keep);
    return { isRebuilding: await triggerRebuild() };
  },
});

export const discardDrafts = defineAction({
  handler: async (_input, context) => {
    await requireAdmin(context);
    await clearDrafts();
  },
});

export const exportJson = defineAction({
  handler: async (_input, context) => {
    await requireAdmin(context);
    const published = {
      team: await readEntries('published', 'team'),
      groupes: await readEntries('published', 'groupes'),
    };
    const drafts = { team: await readEntries('draft', 'team'), groupes: await readEntries('draft', 'groupes') };
    return { exportedAt: new Date().toISOString(), published, drafts };
  },
});
