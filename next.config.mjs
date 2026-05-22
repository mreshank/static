/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Global security headers for all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Admin routes — CSP must allow Clerk domains for auth UI + scripts
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
              "img-src 'self' blob: data: https: https://img.clerk.com",
              "connect-src 'self' https: https://*.clerk.accounts.dev",
              "font-src 'self' data: https://*.clerk.accounts.dev",
              "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
      // CDN file serving paths — strict anti-scrape headers
      {
        source: "/((?!admin|api|_next|robots.txt).*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Download-Options", value: "noopen" },
        ],
      },
    ];
  },
};

export default nextConfig;
