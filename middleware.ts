import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Matcher for administrative routes requiring login
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/files(.*)",
  "/api/upload(.*)",
  "/api/purge(.*)",
  "/api/stats(.*)"
]);

export default clerkMiddleware((auth, req) => {
  const { nextUrl } = req;
  const isSignInPage = nextUrl.pathname.startsWith("/admin/sign-in");

  // Protect administrative routes, except for the sign-in page itself
  if (isAdminRoute(req) && !isSignInPage) {
    auth().protect();
  }

  // Inject security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
});

export const config = {
  matcher: [
    // Protect /admin routes and administrative api routes
    "/admin/:path*",
    "/api/files/:path*",
    "/api/upload/:path*",
    "/api/purge/:path*",
    "/api/stats/:path*",
  ],
};
