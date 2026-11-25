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

/** Netlify builds can't read Blobs, so they fetch the published content from the live site. */
async function fetchFromLiveSite(collection: PublishedCollection): Promise<unknown[]> {
  const siteUrl = process.env.URL;
  if (siteUrl === undefined) {
    throw new Error('the URL environment variable is missing');
  }
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

/**
 * Content published from the back office: fetched from the live site on Netlify builds, read from Blobs
 * elsewhere (emulated by `astro dev`). If it can't be read, the collection is empty and the section shows
 * an "unavailable" message.
 */
export function publishedLoader(collection: PublishedCollection): Loader {
  return {
    name: 'published-loader',
    load: async context => {
      let items: unknown[] = [];
      try {
        items = process.env.NETLIFY === 'true' ? await fetchFromLiveSite(collection) : await readPublished(collection);
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
