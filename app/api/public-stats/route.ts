import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const runtime = "edge";

/**
 * Public-facing stats endpoint that exposes ONLY aggregate numbers.
 * No file paths, names, metadata, or folder structures are leaked.
 * This endpoint is NOT behind Clerk auth (not matched by middleware).
 */
export async function GET() {
  try {
    const [totalSize, totalFiles] = await Promise.all([
      kv.get<number>("stats:total_size"),
      kv.get<number>("stats:total_files"),
    ]);

    return NextResponse.json(
      {
        totalSize: totalSize || 0,
        totalFiles: totalFiles || 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  } catch {
    // Fail gracefully — return zeros if Redis is unreachable
    return NextResponse.json(
      { totalSize: 0, totalFiles: 0 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  }
}
