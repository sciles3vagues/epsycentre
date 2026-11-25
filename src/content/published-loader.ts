import { PUBLISHED_SLUGS } from '@/lib/content-schemas';

import type { PublishedCollection } from '@/lib/content-schemas';
import type { Loader, LoaderContext } from 'astro/loaders';

interface Options {
  collection: PublishedCollection;
  /** Placeholder data used outside Netlify builds (local dev, CI) and when a preview can't reach the live site. */
  fixtures: unknown[];
}

const idOf = (item: unknown): string => {
  if (typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'string') {
    return item.id;
  }
  throw new Error(`Published entry without a string id: ${JSON.stringify(item)}`);
};

/**
 * Netlify builds can't read Blobs, so they fetch the published content from the live site
 * (`/contenu/<slug>.json`). A production build fails rather than publish fixtures.
 */
async function fetchPublished({ collection, fixtures }: Options, logger: LoaderContext['logger']): Promise<unknown[]> {
  const siteUrl = process.env.URL;
  if (process.env.NETLIFY !== 'true' || siteUrl === undefined) {
    return fixtures;
  }
  const isProduction = process.env.CONTEXT === 'production';
  const url = new URL(`/contenu/${PUBLISHED_SLUGS[collection]}.json`, siteUrl);
  try {
    const response = await fetch(url);
    if (response.status === 404 && isProduction) {
      logger.warn(`${url.href} is not deployed yet: publishing an empty list.`);
      return [];
    }
    if (!response.ok) {
      throw new Error(`${url.href} answered ${response.status}`);
    }
    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`${url.href} did not return a list`);
    }
    return data as unknown[];
  } catch (error) {
    const reason = `Published content unavailable at ${url.href} (${error instanceof Error ? error.message : String(error)})`;
    if (isProduction) {
      throw new Error(reason, { cause: error });
    }
    logger.warn(`${reason}: using fixtures.`);
    return fixtures;
  }
}

export function publishedLoader(options: Options): Loader {
  return {
    name: 'published-loader',
    load: async context => {
      const items = await fetchPublished(options, context.logger);
      context.store.clear();
      for (const item of items) {
        const id = idOf(item);
        const data = await context.parseData({ id, data: item as Record<string, unknown> });
        context.store.set({ id, data });
      }
    },
  };
}
