import { createClient } from "@vercel/kv";

// Create a custom KV client with support for custom prefixes and default fallbacks.
export const kv = createClient({
  url: process.env.STATIC_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.STATIC_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});
