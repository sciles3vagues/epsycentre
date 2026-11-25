import { photoKeySchema } from '@/lib/content-schemas';
import { readPhoto } from '@/lib/photo-store';

import type { APIRoute } from 'astro';

export const prerender = false;

/** Team photos from Blobs. Keys are random UUIDs never reused, so responses are cached forever. */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  const photo = photoKeySchema.safeParse(key).success && key !== undefined ? await readPhoto(key) : null;
  if (photo === null) {
    return new Response(null, { status: 404 });
  }
  return new Response(photo.data, {
    headers: {
      'Content-Type': photo.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
