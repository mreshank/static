import { NextRequest, NextResponse } from "next/server";
import { createFolder, listFolderContents, registerFile } from "@/lib/cache";
import { sanitizePath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "";

    let sanitizedFolder = "";
    if (folder) {
      try {
        sanitizedFolder = sanitizePath(folder);
      } catch {
        return NextResponse.json({ error: "Invalid folder path" }, { status: 400 });
      }
    }

    const contents = await listFolderContents(sanitizedFolder);
    return NextResponse.json(contents);
  } catch (error) {
    console.error("GET /api/files error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "folder") {
      const { path } = body;
      if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 });
      }

      let sanitizedPath: string;
      try {
        sanitizedPath = sanitizePath(path);
      } catch {
        return NextResponse.json({ error: "Invalid folder path" }, { status: 400 });
      }

      await createFolder(sanitizedPath);
      return NextResponse.json({ success: true, path: sanitizedPath });
    }

    if (type === "file") {
      const { metadata } = body;
      if (!metadata || !metadata.path || !metadata.blobUrl || !metadata.size) {
        return NextResponse.json({ error: "Invalid file metadata" }, { status: 400 });
      }

      let sanitizedPath: string;
      try {
        sanitizedPath = sanitizePath(metadata.path);
      } catch {
        return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
      }

      const fileMeta = {
        ...metadata,
        path: sanitizedPath,
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      await registerFile(fileMeta);
      return NextResponse.json({ success: true, metadata: fileMeta });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/files error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
