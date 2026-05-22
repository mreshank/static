import { NextRequest } from "next/server";
import { getFileMeta } from "@/lib/cache";
import { generateETag, sanitizePath } from "@/lib/utils";
import { DEFAULT_MIME_TYPE } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

/**
 * CORS preflight handler — browsers send OPTIONS before cross-origin requests
 * for fonts, fetch() calls, and non-simple headers. Respond instantly from edge.
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, If-None-Match, If-Modified-Since",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract client IP address safely in Edge runtime
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = request.ip || (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");

    // 1. Run dynamic Edge rate-limiting and client fingerprinting
    const limitResult = await rateLimit(request, clientIp);
    
    // If rate-limited, return a generic blank 404 response to deter scanning/scraping
    if (!limitResult.success) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limitResult.reset.toString(),
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }

    // 2. Parse and sanitize the path from the URL params
    const rawPath = params.path.join("/");
    let cleanPath: string;
    try {
      cleanPath = sanitizePath(rawPath);
    } catch {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }

    // 3. Lookup file metadata from KV cache
    const meta = await getFileMeta(cleanPath);
    if (!meta) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }

    // 4. Handle conditional request checking (ETag / Last-Modified) for 304 optimization
    const ifNoneMatch = request.headers.get("if-none-match");
    const ifModifiedSince = request.headers.get("if-modified-since");

    const clientETag = ifNoneMatch ? ifNoneMatch.trim() : null;
    const serverETag = meta.etag || generateETag(meta.size, meta.lastModified);

    // ETag comparison
    if (clientETag && (clientETag === serverETag || clientETag === `W/${serverETag}`)) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: serverETag,
          "Access-Control-Allow-Origin": "*",
          "X-Cache": "HIT",
          "X-RateLimit-Limit": limitResult.limit.toString(),
          "X-RateLimit-Remaining": limitResult.remaining.toString(),
          "X-RateLimit-Reset": limitResult.reset.toString(),
        },
      });
    }

    // Last-Modified comparison
    if (ifModifiedSince && meta.lastModified) {
      const clientModifiedDate = new Date(ifModifiedSince).getTime();
      const serverModifiedDate = new Date(meta.lastModified).getTime();
      if (!isNaN(clientModifiedDate) && serverModifiedDate <= clientModifiedDate) {
        return new Response(null, {
          status: 304,
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            ETag: serverETag,
            "Access-Control-Allow-Origin": "*",
            "X-Cache": "HIT",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
            "X-RateLimit-Reset": limitResult.reset.toString(),
          },
        });
      }
    }

    // 5. Fetch the file content from Vercel Blob and stream it
    const fileResponse = await fetch(meta.blobUrl, {
      headers: {
        Range: request.headers.get("Range") || "",
      },
    });

    if (!fileResponse.ok && fileResponse.status !== 206) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }

    // 6. Construct response headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", meta.mimeType || DEFAULT_MIME_TYPE);
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    responseHeaders.set("ETag", serverETag);
    responseHeaders.set("Last-Modified", new Date(meta.lastModified).toUTCString());
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Vary", "Accept-Encoding");
    responseHeaders.set("X-Cache", "MISS"); // Edge cache handles eventual HIT, this is origin state
    
    // Forward Rate limit information
    responseHeaders.set("X-RateLimit-Limit", limitResult.limit.toString());
    responseHeaders.set("X-RateLimit-Remaining", limitResult.remaining.toString());
    responseHeaders.set("X-RateLimit-Reset", limitResult.reset.toString());

    // Content-Range support for media streams (206 Partial Content)
    const contentRange = fileResponse.headers.get("Content-Range");
    const contentLength = fileResponse.headers.get("Content-Length");

    if (contentRange) responseHeaders.set("Content-Range", contentRange);
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    return new Response(fileResponse.body, {
      status: fileResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("CDN serve error:", error);
    // Render blank generic 404 to avoid leaking system stack details on crash
    return new Response(
      JSON.stringify({ error: "File not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  }
}

/**
 * HEAD handler — returns the same headers as GET but with no body.
 * Used by CDN clients, link checkers, and monitoring probes.
 */
export async function HEAD(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const response = await GET(request, context);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
