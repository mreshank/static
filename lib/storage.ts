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
  const token = process.env.STATIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  const blob = await put(path, content, {
    access: "public",
    contentType: contentType,
    addRandomSuffix: false, // Maintain exact CDN pathname
    token,
  });
  
  const metadata = await head(blob.url, { token });
  
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
  const token = process.env.STATIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  await del(url, { token });
}

/**
 * Lists all blobs (mostly for debugging or sync, KV is primary index).
 */
export async function listStorageFiles(limit = 100) {
  const token = process.env.STATIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  const result = await list({ limit, token });
  return result.blobs;
}
