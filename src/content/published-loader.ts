import { PUBLISHED_SLUGS } from '@/lib/content-schemas';
import { readPublished } from '@/lib/content-store';

import type { PublishedCollection } from '@/lib/content-schemas';
import type { Loader } from 'astro/loaders';

const idOf = (item: unknown): string => {
  if (typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'string') {
    return item.id;
  }
  throw new Error(`Published entry without a string id: ${JSON.stringify(item)}`);
};

async function fetchFromLiveSite(collection: PublishedCollection, siteUrl: string): Promise<unknown[]> {
  const url = new URL(`/contenu/${PUBLISHED_SLUGS[collection]}.json`, siteUrl);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url.href} answered ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`${url.href} did not return a list`);
  }
  return data as unknown[];
}

async function loadPublished(collection: PublishedCollection): Promise<unknown[]> {
  const liveSiteUrl = process.env.PUBLISHED_SITE_URL;
  if (process.env.NETLIFY !== 'true' && liveSiteUrl !== undefined && liveSiteUrl !== '') {
    return fetchFromLiveSite(collection, liveSiteUrl);
  }
  return readPublished(collection);
}

/**
 * Content published from the back office. Netlify builds read Blobs directly (the public URL may be access-protected);
 * locally it is fetched from `PUBLISHED_SITE_URL` when set, otherwise read from Blobs (emulated by `astro dev`). If it
 * can't be read, the collection is empty and the section shows an "unavailable" message.
 */
export function publishedLoader(collection: PublishedCollection): Loader {
  return {
    name: 'published-loader',
    load: async context => {
      let items: unknown[] = [];
      try {
        items = await loadPublished(collection);
      } catch (error) {
        context.logger.error(
          `Published ${collection} unavailable: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      context.store.clear();
      for (const item of items) {
        const id = idOf(item);
        const data = await context.parseData({ id, data: item as Record<string, unknown> });
        context.store.set({ id, data });
      }
    },
  };
}
