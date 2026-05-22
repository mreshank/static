import { handleUpload } from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  // Guard endpoint - check authentication
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Admin session required." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      token: process.env.STATIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: undefined, // Allow all file types (it's a CDN)
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB limit
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Metadata registration is handled by the client's subsequent /api/files call
        // to maintain consistency with UI flow and folder structures.
        console.log("Vercel Blob upload completed:", blob.pathname);
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Presign upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate presigned upload token";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
