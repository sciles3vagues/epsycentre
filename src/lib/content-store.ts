import { getStore } from '@netlify/blobs';

import { PUBLISHED_COLLECTIONS } from '@/lib/content-schemas';

import type { PublishedCollection } from '@/lib/content-schemas';

type Stage = 'draft' | 'published';

const META_KEY = 'meta/published-at';

// Strong consistency: the rebuild triggered right after « Publier » must read the new version.
const contentStore = () => getStore({ name: 'content', consistency: 'strong' });

const keyOf = (stage: Stage, collection: PublishedCollection): string => `${stage}/${collection}`;

/** Raw stored list, or null when that stage has nothing (no draft = same as published). */
export async function readEntries(stage: Stage, collection: PublishedCollection): Promise<unknown[] | null> {
  const data: unknown = await contentStore().get(keyOf(stage, collection), { type: 'json' });
  return Array.isArray(data) ? (data as unknown[]) : null;
}

export async function readPublished(collection: PublishedCollection): Promise<unknown[]> {
  return (await readEntries('published', collection)) ?? [];
}

export async function writeDraft(collection: PublishedCollection, entries: unknown[]): Promise<void> {
  await contentStore().setJSON(keyOf('draft', collection), entries);
}

export async function hasDrafts(): Promise<boolean> {
  const { blobs } = await contentStore().list({ prefix: 'draft/' });
  return blobs.length > 0;
}

export async function discardDrafts(): Promise<void> {
  await Promise.all(PUBLISHED_COLLECTIONS.map(collection => contentStore().delete(keyOf('draft', collection))));
}

/** Copies every draft over its published version, then clears the drafts and records the date. */
export async function publishDrafts(): Promise<void> {
  const store = contentStore();
  for (const collection of PUBLISHED_COLLECTIONS) {
    const draft = await readEntries('draft', collection);
    if (draft !== null) {
      await store.setJSON(keyOf('published', collection), draft);
    }
  }
  await discardDrafts();
  await store.set(META_KEY, new Date().toISOString());
}

export async function readPublishedAt(): Promise<string | null> {
  return contentStore().get(META_KEY, { type: 'text' });
}
