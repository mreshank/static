import { kv } from "@vercel/kv";

export interface FileMetadata {
  id: string;
  path: string;           // e.g. "gamepad/styles.css"
  name: string;           // e.g. "styles.css"
  folder: string;         // e.g. "gamepad" (empty string for root)
  blobUrl: string;        // Vercel Blob URL
  mimeType: string;
  size: number;
  etag: string;
  uploadedAt: string;
  lastModified: string;
}

export interface Stats {
  totalSize: number;
  totalFiles: number;
  uploadCount: number;
}

/**
 * Gets a file's metadata from KV by its path.
 */
export async function getFileMeta(path: string): Promise<FileMetadata | null> {
  return await kv.get<FileMetadata>(`file:${path}`);
}

/**
 * Saves file metadata to KV.
 */
export async function setFileMeta(path: string, meta: FileMetadata): Promise<void> {
  await kv.set(`file:${path}`, meta);
}

/**
 * Deletes file metadata from KV.
 */
export async function deleteFileMeta(path: string): Promise<void> {
  await kv.del(`file:${path}`);
}

/**
 * Helper to split path into segments and build parent indexes.
 * e.g., for "a/b/file.txt", adds "file.txt" to folder:a/b, "b/" to folder:a, and "a/" to folder:root.
 */
async function indexParentFolders(path: string): Promise<void> {
  const segments = path.split("/");
  if (segments.length <= 1) {
    // Root file
    await kv.sadd("folder:root", path);
    return;
  }

  // Add the file to its immediate parent folder
  const fileName = segments[segments.length - 1];
  const immediateParent = segments.slice(0, -1).join("/");
  await kv.sadd(`folder:${immediateParent}`, fileName);

  // Traverse upwards to index the folders
  let currentFolder = immediateParent;
  while (currentFolder.includes("/")) {
    const parentSegments = currentFolder.split("/");
    const folderName = parentSegments[parentSegments.length - 1];
    const grandParent = parentSegments.slice(0, -1).join("/");
    
    await kv.sadd(`folder:${grandParent}`, `${folderName}/`);
    currentFolder = grandParent;
  }
  
  // Finally, add the top-level folder to root
  if (currentFolder) {
    await kv.sadd("folder:root", `${currentFolder}/`);
  }
}

/**
 * Registers a file in KV metadata, parent index, and updates global stats.
 */
export async function registerFile(meta: FileMetadata): Promise<void> {
  await setFileMeta(meta.path, meta);
  await indexParentFolders(meta.path);
  
  // Update stats
  await kv.incrby("stats:total_size", meta.size);
  await kv.incr("stats:total_files");
  await kv.incr("stats:upload_count");
}

/**
 * Creates an empty folder structure by adding it to parent indexes.
 */
export async function createFolder(folderPath: string): Promise<void> {
  const cleanPath = folderPath.replace(/\/+$/, "");
  if (!cleanPath) return;

  const segments = cleanPath.split("/");
  const folderName = segments[segments.length - 1];
  
  if (segments.length === 1) {
    await kv.sadd("folder:root", `${folderName}/`);
  } else {
    const parent = segments.slice(0, -1).join("/");
    await kv.sadd(`folder:${parent}`, `${folderName}/`);
    // Ensure parent directories are also indexed recursively
    await indexParentFolders(`${parent}/_dummy`);
    await kv.srem(`folder:${parent}`, "_dummy");
  }

  // Ensure the folder set itself exists (empty set marker, or just ensure empty)
  // Redis sets don't need initialization, but we can set a metadata flag if wanted
  await kv.sadd(`folder:${cleanPath}`, ".keep");
}

/**
 * Removes a file from KV metadata, parent index, and updates global stats.
 */
export async function unregisterFile(path: string, size: number): Promise<void> {
  await deleteFileMeta(path);

  const segments = path.split("/");
  if (segments.length <= 1) {
    await kv.srem("folder:root", path);
  } else {
    const fileName = segments[segments.length - 1];
    const parent = segments.slice(0, -1).join("/");
    await kv.srem(`folder:${parent}`, fileName);
  }

  // Update stats
  await kv.decrby("stats:total_size", size);
  await kv.decr("stats:total_files");
}

/**
 * Lists contents of a specific folder.
 * Returns arrays of files (with metadata) and subfolder paths.
 */
export async function listFolderContents(folderPath: string): Promise<{
  files: FileMetadata[];
  folders: string[];
}> {
  const key = folderPath ? `folder:${folderPath}` : "folder:root";
  const members = await kv.smembers(key);

  const files: FileMetadata[] = [];
  const folders: string[] = [];

  // Filter out empty folder keep markers
  const activeMembers = members.filter(m => m !== ".keep");

  for (const member of activeMembers) {
    if (member.endsWith("/")) {
      folders.push(member.slice(0, -1));
    } else {
      const filePath = folderPath ? `${folderPath}/${member}` : member;
      const meta = await getFileMeta(filePath);
      if (meta) {
        files.push(meta);
      } else {
        // Stale index cleanup helper
        await kv.srem(key, member);
      }
    }
  }

  // Sort alphabetically
  files.sort((a, b) => a.name.localeCompare(b.name));
  folders.sort();

  return { files, folders };
}

/**
 * Lists all folders and files recursively (flat list of file metadata).
 */
export async function listAllFilesRecursively(currentPath = ""): Promise<FileMetadata[]> {
  const { files, folders } = await listFolderContents(currentPath);
  let allFiles = [...files];

  for (const folder of folders) {
    const subFolderPath = currentPath ? `${currentPath}/${folder}` : folder;
    const subFiles = await listAllFilesRecursively(subFolderPath);
    allFiles = allFiles.concat(subFiles);
  }

  return allFiles;
}

/**
 * Delete a folder and all its contents recursively.
 * Returns the list of deleted files (to allow deletion from Blob storage).
 */
export async function deleteFolderRecursively(folderPath: string): Promise<FileMetadata[]> {
  const cleanPath = folderPath.replace(/\/+$/, "");
  if (!cleanPath) return [];

  const filesToDelete = await listAllFilesRecursively(cleanPath);

  // Unregister all files
  for (const file of filesToDelete) {
    await unregisterFile(file.path, file.size);
  }

  // Delete all nested folder sets
  const deleteKeys = [
    `folder:${cleanPath}`,
    ...filesToDelete.map(f => `folder:${f.folder}`).filter((v, i, a) => a.indexOf(v) === i)
  ];
  
  if (deleteKeys.length > 0) {
    await kv.del(...deleteKeys);
  }

  // Remove the folder itself from its parent index
  const segments = cleanPath.split("/");
  const folderName = segments[segments.length - 1];
  if (segments.length === 1) {
    await kv.srem("folder:root", `${folderName}/`);
  } else {
    const parent = segments.slice(0, -1).join("/");
    await kv.srem(`folder:${parent}`, `${folderName}/`);
  }

  return filesToDelete;
}

/**
 * Retrieve global CDN stats.
 */
export async function getStats(): Promise<Stats> {
  const totalSize = (await kv.get<number>("stats:total_size")) || 0;
  const totalFiles = (await kv.get<number>("stats:total_files")) || 0;
  const uploadCount = (await kv.get<number>("stats:upload_count")) || 0;

  return {
    totalSize,
    totalFiles,
    uploadCount,
  };
}
