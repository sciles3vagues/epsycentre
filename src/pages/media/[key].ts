import { getStore } from '@netlify/blobs';

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = params.key ?? '';
  const entry = await getStore('photos').getWithMetadata(key, { type: 'arrayBuffer' });
  if (entry === null) {
    return new Response(null, { status: 404 });
  }
  const contentType =
    typeof entry.metadata.contentType === 'string' ? entry.metadata.contentType : 'application/octet-stream';
  return new Response(entry.data, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
