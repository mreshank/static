import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sanitizePath } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    let sanitizedPath: string;
    try {
      sanitizedPath = sanitizePath(path);
    } catch {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Force Next.js Edge Data Cache to revalidate the CDN path
    revalidatePath(`/${sanitizedPath}`);
    revalidatePath(`/${sanitizedPath}`, "page");

    return NextResponse.json({
      success: true,
      message: `Cache purged successfully for path: /${sanitizedPath}`,
    });
  } catch (error) {
    console.error("Purge cache API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
