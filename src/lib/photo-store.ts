import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';

interface StoredPhoto {
  data: ArrayBuffer;
  contentType: string;
}

const photoStore = () => getStore({ name: 'photos', consistency: 'strong' });

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  signature.every((byte, index) => bytes[offset + index] === byte);

/** Image type from the file's first bytes (the declared MIME type can't be trusted). */
export function detectImageType(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  // "RIFF" … "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  return null;
}

export async function readPhoto(key: string): Promise<StoredPhoto | null> {
  const entry = await photoStore().getWithMetadata(key, { type: 'arrayBuffer' });
  if (entry === null) {
    return null;
  }
  const { contentType } = entry.metadata;
  return { data: entry.data, contentType: typeof contentType === 'string' ? contentType : 'application/octet-stream' };
}

/** Stores the photo under a new random key (never reused, so it can be cached forever). */
export async function savePhoto(data: ArrayBuffer, contentType: string): Promise<string> {
  const key = randomUUID();
  await photoStore().set(key, data, { metadata: { contentType } });
  return key;
}

export async function deletePhotosExcept(keep: ReadonlySet<string>): Promise<number> {
  const store = photoStore();
  const { blobs } = await store.list();
  const orphans = blobs.filter(({ key }) => !keep.has(key));
  await Promise.all(orphans.map(({ key }) => store.delete(key)));
  return orphans.length;
}
