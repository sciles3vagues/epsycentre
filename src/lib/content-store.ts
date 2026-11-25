import { getStore } from '@netlify/blobs';

import type { PublishedCollection } from '@/lib/content-schemas';

// Strong consistency: the rebuild triggered right after « Publier » must read the new version.
const contentStore = () => getStore({ name: 'content', consistency: 'strong' });

export async function readPublished(collection: PublishedCollection): Promise<unknown[]> {
  const data: unknown = await contentStore().get(`published/${collection}`, { type: 'json' });
  return Array.isArray(data) ? (data as unknown[]) : [];
}
