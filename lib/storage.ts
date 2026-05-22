import { put, del, list, head } from "@vercel/blob";

export interface StorageFile {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
}

/**
 * Uploads a file buffer/stream directly to Vercel Blob storage.
 * Used for backend uploads like URL-based uploading.
 */
export async function uploadToStorage(
  path: string,
  content: Buffer | ReadableStream | string,
  contentType: string
): Promise<StorageFile> {
  const blob = await put(path, content, {
    access: "public",
    contentType: contentType,
    addRandomSuffix: false, // Maintain exact CDN pathname
  });
  
  const metadata = await head(blob.url);
  
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: metadata.size,
  };
}

/**
 * Deletes a file from Vercel Blob storage.
 */
export async function deleteFromStorage(url: string): Promise<void> {
  await del(url);
}

/**
 * Lists all blobs (mostly for debugging or sync, KV is primary index).
 */
export async function listStorageFiles(limit = 100) {
  const result = await list({ limit });
  return result.blobs;
}
