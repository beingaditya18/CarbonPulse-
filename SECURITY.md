# CarbonPulse AI+ Security Policy & Threat Model

This document outlines the security architecture, data handling practices, and vulnerability reporting procedures for CarbonPulse AI+.

---

## 🔒 1. Client-Side Security Model

CarbonPulse AI+ is designed with a **zero-trust client architecture**. Because the application is an offline-first PWA, all user data persistence occurs on the client device.

* **Server-Side Storage**: No sensitive user-identifiable data, logs, or credentials are stored on our servers.
* **Untrusted LocalStorage**: All local state persistence relies on Zustand + `localStorage`. We treat `localStorage` as **entirely untrusted** and susceptible to tampering.
* **Runtime Zod Validation**: Every single read from `localStorage` is re-validated against a complete Zod schema structure before it is parsed into the Zustand store.
* **Fail-Closed Design**: If any cached data is found to be malformed, modified, or tampered with, the validator triggers a fail-closed sequence. The invalid state is rejected, returns `null` or empty fields, and resets to safe defaults rather than throwing errors to the UI or leaking partial data.
* **API Key Exposure Prevention**: Absolutely no enterprise API keys (Google Cloud Vision, Gemini API, Google Maps) are exposed client-side. The client communicates exclusively through Next.js Edge API routes, which serve as secure proxies.

---

## 🛡️ 2. HTTP Security Headers

Our `next.config.ts` enforces modern HTTP security headers on all server responses to protect users from Cross-Site Scripting (XSS), clickjacking, and content sniffing:

* **Content-Security-Policy (CSP)**:
  * Employs per-request cryptographically secure random nonces generated in `middleware.ts`.
  * Configured with `strict-dynamic` to allow trusted scripts to load dependencies transitively without static white-listing.
  * Explicitly forbids `unsafe-inline` for script execution.
* **X-Frame-Options**: `DENY` to prevent clickjacking attacks.
* **X-Content-Type-Options**: `nosniff` to force browsers to respect declared MIME types.
* **Referrer-Policy**: `strict-origin-when-cross-origin` to avoid leaking paths in referrer headers.
* **Permissions-Policy**: Restricts access to sensitive browser features:
  `camera=(), microphone=(), geolocation=()` (or camera restricted explicitly to receipt capture pages only).
* **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload` to enforce secure HTTPS connections.

---

## 📥 3. Input & Output Validation

* **Zod Schemas**: Every inbound edge route payload (e.g., `/api/chat` and `/api/carbon/receipt`) is validated using strict, non-permissive Zod schemas. Any deviation in type, length, or boundary values results in an immediate `400 Bad Request` response.
* **OCR Receipt Upload Limits**:
  * Uploaded receipt files are strictly limited to a **4MB file size cap**.
  * Handlers validate uploads using file magic-bytes signatures (JPEG/PNG/WebP only) rather than trusting client-reported file extensions or MIME-types.
* **Output Sanitization**: All dynamic user strings or model outputs (e.g., chatbot responses) are escaped and sanitized via `sanitizeInput` before DOM insertion to neutralize XSS vectors.
* **InnerHTML Restrictions**: The application forbids the use of `dangerouslySetInnerHTML` for any user-generated or AI-generated string inputs without prior sanitization.

---

## ⏳ 4. Rate Limiting

* **IP-Based Token Bucket**: All serverless Edge API routes are protected by an in-memory token-bucket rate limiter (`rateLimiter.ts`).
* **Capacity Boundaries**: The bucket has a default capacity of **10 tokens** per unique client IP, refilling at a rate of **1 token per 60 seconds**.
* **Edge Compatibility**: The rate-limiter logic executes on the edge with minimal overhead, preventing denial-of-service (DoS) attempts from consuming resource budgets.

---

## ☁️ 5. Google Cloud Platform (GCP) Security Layer

Production deployments integrate GCP enterprise guards:
* **Google Cloud Armor**: A Web Application Firewall (WAF) filters SQL injection, XSS, and layer 7 DDoS vectors before requests reach the Vercel/GCP backend.
* **Identity-Aware Proxy (IAP)**: Secures access control using OAuth2 identity providers for administrative dashboards.
* **Cloud Storage (GCS) Policies**: Temporary image files uploaded during OCR processing are stored under secure IAM policies with automated Lifecycle Management rules that delete assets after 24 hours.

---

## 📦 6. Dependency & Build Auditing

* **CI Lockfile Enforcement**: All CI/CD workflows compile code using `npm ci` to guarantee builds match the verified lockfile exactly.
* **Automated Audits**: We recommend configuring `npm audit` inside CI gates and enabling **Dependabot** to track vulnerability alerts and automate library upgrades.

---

## 📞 7. Reporting Vulnerabilities

If you discover a security vulnerability, please do not open a public issue. Instead, report it directly to our security team:

* **Email**: `security@carbonpulse.ai`
* **GPG Key**: Available upon request.
* We aim to acknowledge all reports within 24 hours and provide a patch/mitigation plan within 72 hours.
