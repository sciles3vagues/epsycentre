import { getStore } from '@netlify/blobs';

interface StoredPhoto {
  data: ArrayBuffer;
  contentType: string;
}

const photoStore = () => getStore('photos');

export async function readPhoto(key: string): Promise<StoredPhoto | null> {
  const entry = await photoStore().getWithMetadata(key, { type: 'arrayBuffer' });
  if (entry === null) {
    return null;
  }
  const { contentType } = entry.metadata;
  return { data: entry.data, contentType: typeof contentType === 'string' ? contentType : 'application/octet-stream' };
}
