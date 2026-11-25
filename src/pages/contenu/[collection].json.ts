import { collectionFromSlug } from '@/lib/content-schemas';
import { readPublished } from '@/lib/content-store';

import type { APIRoute } from 'astro';

export const prerender = false;

/** Published (public) content, read by the build-time loader. Drafts are never exposed here. */
export const GET: APIRoute = async ({ params }) => {
  const collection = collectionFromSlug(params.collection);
  if (collection === undefined) {
    return new Response(null, { status: 404 });
  }
  return Response.json(await readPublished(collection), {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
};
