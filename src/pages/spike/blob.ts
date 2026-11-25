import { getStore } from '@netlify/blobs';

import photoDataUrl from '@/assets/images/team/placeholder.jpg?inline';

import type { APIRoute } from 'astro';

export const prerender = false;

// SPIKE: seeds one photo and one JSON entry, then reads them back.
export const GET: APIRoute = async () => {
  try {
    const photos = getStore('photos');
    const content = getStore('content');
    const bytes = Buffer.from(photoDataUrl.split(',')[1] ?? '', 'base64');
    await photos.set('spike-photo', new Blob([bytes]), {
      metadata: { contentType: 'image/jpeg', width: 898, height: 1246 },
    });
    await content.setJSON('spike/team', [{ id: 'spike', name: 'Spike' }]);
    const json: unknown = await content.get('spike/team', { type: 'json' });
    const meta = await photos.getMetadata('spike-photo');
    return Response.json({ json, meta, bytes: bytes.length });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) },
      { status: 500 }
    );
  }
};
