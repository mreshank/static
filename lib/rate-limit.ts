import { kv } from "@vercel/kv";

// Edge-native Web Crypto SHA-256 hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface RateLimitResult {
  success: boolean; // True if request is allowed, False if rate limited
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Ultra-fast edge rate limiter using Upstash Redis (Vercel KV) pipelined operations.
 * Protects public CDN files from brute-force scanners, scraper dictionary attacks, and DDoSes.
 * Default Limit: 100 requests per 10-second window per user signature.
 */
export async function rateLimit(
  request: Request,
  ip: string
): Promise<RateLimitResult> {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const platform = request.headers.get("sec-ch-ua-platform") || "";

  // 1. Generate multi-dimensional fingerprint for the client environment
  const rawFingerprint = `${ip}:${userAgent}:${acceptLanguage}:${platform}`;
  const fingerprint = await sha256(rawFingerprint);

  // 2. Sliding window calculation (10 second segments)
  const windowSizeSeconds = 10;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentWindow = Math.floor(currentTimestamp / windowSizeSeconds) * windowSizeSeconds;
  
  const key = `ratelimit:${fingerprint}:${currentWindow}`;
  const limit = 100; // Maximum allowed requests inside 10 seconds

  try {
    // 3. Atomically increment request count and set expiration using a pipelined request
    const pipeline = kv.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSizeSeconds * 3); // Persist for 30s to allow overlapping checks
    
    const results = await pipeline.exec();
    const count = (results[0] as number) || 1;
    
    const remaining = Math.max(0, limit - count);
    const reset = currentWindow + windowSizeSeconds;

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // Fail-open strategy: Prevent database glitches from interrupting CDN availability
    console.error("Rate limiter Redis failure:", error);
    return {
      success: true,
      limit,
      remaining: 1,
      reset: currentTimestamp + windowSizeSeconds,
    };
  }
}
