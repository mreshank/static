/**
 * Dynamic robots.txt to prevent crawlers from indexing:
 * - Admin panel routes
 * - API endpoints (file listings, stats, upload)
 * - Any file scanning/brute-force discovery
 */
export async function GET() {
  let domain = "static.mreshank.com";
  if (process.env.NEXT_PUBLIC_CDN_BASE) {
    try {
      domain = new URL(process.env.NEXT_PUBLIC_CDN_BASE).hostname;
    } catch {
      domain = process.env.NEXT_PUBLIC_CDN_BASE.replace(/^https?:\/\//, "");
    }
  }

  const body = `# ${domain} robots.txt
User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /api/files
Disallow: /api/stats
Disallow: /api/upload
Disallow: /api/purge
Disallow: /api/public-stats

# Block common AI/scraper bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

# No sitemap — files are private and should not be indexed
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
