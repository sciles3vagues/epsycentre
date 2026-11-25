import { readFile } from 'node:fs/promises';
import { getStore } from '@netlify/blobs';

import type { APIRoute } from 'astro';

export const prerender = false;

// SPIKE: seeds one photo and one JSON entry, then reads them back.
export const GET: APIRoute = async () => {
  const photos = getStore('photos');
  const content = getStore('content');
  const bytes = await readFile('src/assets/images/team/placeholder.jpg');
  await photos.set('spike-photo', new Blob([bytes]), {
    metadata: { contentType: 'image/jpeg', width: 898, height: 1246 },
  });
  await content.setJSON('spike/team', [{ id: 'spike', name: 'Spike' }]);
  const json: unknown = await content.get('spike/team', { type: 'json' });
  const meta = await photos.getMetadata('spike-photo');
  return Response.json({ json, meta });
};
