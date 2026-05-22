# Security Policy

We take the security of this Static CDN & Admin Portal seriously. This repository is designed to be fully open-source while remaining secure for production deployments.

---

## 🛡️ Built-in Security Mitigations

The project implements several production-grade security measures out of the box:

### 1. Zero-Exposure CDN Serving
* **Direct Listing Protection:** There is no way to scan or list all hosted files without knowing the exact URL. Directory listing is blocked globally.
* **Blank 404s:** Requests for non-existent files or rate-limited sessions return a generic JSON 404 response to deter automated dictionary-attack scanners from discovering structure.
* **No Sitemap / Dynamic Robots:** The dynamic `robots.txt` route prevents search engine indexing of administrative and assets routes entirely.

### 2. Edge Rate Limiting & Fingerprinting
* **Multi-Dimensional Fingerprinting:** Every incoming request to the CDN route is hashed using a client fingerprint combining IP address, User-Agent, Accept-Language, and client platform headers.
* **Sliding Window:** Implemented natively inside Vercel Edge Runtime using high-performance Upstash Redis (Vercel KV) pipelines.
* **Fail-Open Strategy:** If the Redis instance suffers a latency spike or outage, the rate limiter falls back gracefully (fail-open) to ensure CDN assets remain available.

### 3. Edge-Level Sanitization
* **Traversal Mitigation:** The system aggressively sanitizes path parameters at the edge to block directory traversal attacks (e.g., `../`, null bytes, control characters, recursive double-decodes).

### 4. Clerk Enterprise Authentication
* **Admin Route Protection:** All administrative endpoints (`/admin/*`, `/api/files/*`, `/api/upload/*`, `/api/purge/*`, `/api/stats/*`) are locked down using Clerk Middleware at the Edge.
* **Secure Direct Uploads:** Users upload directly to Vercel Blob from their browsers using secure, short-lived presigned URLs generated on the serverless API. Token-based keys are never leaked to the client.

### 5. Strict Content Security Policy (CSP)
* **Resource Whitelisting:** Standard CSP headers are pre-configured to allow script and style execution only from the self-origin and authenticated Clerk domains (`clerk.accounts.dev`, `img.clerk.com`).
* **Frame Protection:** Enforces `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff` on all served pages.

---

## 🔍 Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not open a public issue.** Instead, report it privately to the maintainer:

* **Email:** [security@mreshank.com](mailto:security@mreshank.com)

Please include as much detail as possible, including:
1. **Description** of the vulnerability.
2. **Steps to reproduce** (exploit scripts, request payloads, etc.).
3. **Potential impact** (DoS, information disclosure, privilege escalation, etc.).

We will acknowledge your report within **24–48 hours** and provide a timeline for a coordinated fix and release.

---

## 🔒 Environment Variable Safety

Never commit your `.env.local` file or push real credentials to GitHub. 

Make sure to always:
1. Double-check that `.env.local` is present in your `.gitignore` file.
2. Keep your `CLERK_SECRET_KEY`, `BLOB_READ_WRITE_TOKEN`, and `KV_REST_API_TOKEN` entirely private on your deployment platform (e.g. Vercel dashboard).
