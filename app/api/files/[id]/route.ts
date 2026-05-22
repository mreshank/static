import { NextRequest, NextResponse } from "next/server";
import { deleteFromStorage } from "@/lib/storage";
import {
  deleteFolderRecursively,
  getFileMeta,
  registerFile,
  unregisterFile,
} from "@/lib/cache";
import { sanitizePath } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decodedPath = decodeURIComponent(params.id);
    let sanitizedPath: string;
    try {
      sanitizedPath = sanitizePath(decodedPath);
    } catch {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const fileMeta = await getFileMeta(sanitizedPath);

    if (fileMeta) {
      // 1. Delete single file from Vercel Blob
      try {
        await deleteFromStorage(fileMeta.blobUrl);
      } catch (err) {
        console.warn("Storage deletion warning (might already be deleted):", err);
      }
      
      // 2. Unregister from KV
      await unregisterFile(sanitizedPath, fileMeta.size);
      return NextResponse.json({ success: true, type: "file", path: sanitizedPath });
    } else {
      // 3. Delete folder recursively
      const deletedFiles = await deleteFolderRecursively(sanitizedPath);
      
      // Delete all deleted files from Blob storage
      for (const file of deletedFiles) {
        try {
          await deleteFromStorage(file.blobUrl);
        } catch (err) {
          console.warn(`Storage deletion warning for ${file.path}:`, err);
        }
      }

      return NextResponse.json({
        success: true,
        type: "folder",
        path: sanitizedPath,
        deletedCount: deletedFiles.length,
      });
    }
  } catch (error) {
    console.error("DELETE /api/files/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decodedPath = decodeURIComponent(params.id);
    let sanitizedPath: string;
    try {
      sanitizedPath = sanitizePath(decodedPath);
    } catch {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const fileMeta = await getFileMeta(sanitizedPath);
    if (!fileMeta) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, folder } = body;

    if (name === undefined && folder === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Determine new folder and name
    const newFolder = folder !== undefined ? sanitizePath(folder) : fileMeta.folder;
    const newName = name !== undefined ? name.trim() : fileMeta.name;

    if (!newName) {
      return NextResponse.json({ error: "File name cannot be empty" }, { status: 400 });
    }

    const newPath = newFolder ? `${newFolder}/${newName}` : newName;

    // Check if new path already exists
    if (newPath !== sanitizedPath) {
      const existing = await getFileMeta(newPath);
      if (existing) {
        return NextResponse.json({ error: "Destination path already exists" }, { status: 409 });
      }
    }

    // Update metadata
    const updatedMeta = {
      ...fileMeta,
      path: newPath,
      name: newName,
      folder: newFolder,
      lastModified: new Date().toISOString(),
    };

    // Remove old registration and register new path in KV
    await unregisterFile(sanitizedPath, fileMeta.size);
    await registerFile(updatedMeta);

    return NextResponse.json({ success: true, metadata: updatedMeta });
  } catch (error) {
    console.error("PATCH /api/files/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
