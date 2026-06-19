# Security Specification — Carbon Print AI

Architectural security measures, HTTP headers, and dependency controls implemented in Carbon Print AI.

## Core Security Design

- **Zero-Backend Architecture**: The entire application runs client-side. There are no databases, backend servers, or server-side credentials. This eliminates leak hazards or server compromises.
- **Untrusted Browser Persistence**: All items loaded from `localStorage` are strictly validated using Zod schemas (`src/lib/storage.ts`). Malformed or manipulated data defaults cleanly to an empty state rather than raising runtime errors.
- **Input Sanitization**: User-supplied values are bound and restricted by Zod schemas. The codebase avoids `dangerouslySetInnerHTML` to prevent scripting injections.

## Content Security Policy & HTTP Headers

HTTP security policies are applied dynamically per-request inside `src/middleware.ts` and route configurations inside `next.config.ts`:

- **Content Security Policy (CSP)**: `default-src 'self'` restricts script execution. A dynamic cryptographically secure **nonce** paired with `'strict-dynamic'` ensures only trusted framework scripts execute. Inline script injection is entirely blocked.
- **Frame & Type Restrictions**: `X-Frame-Options: DENY` blocks clickjacking; `X-Content-Type-Options: nosniff` forces standard MIME-type checks.
- **Permissions Control**: Camera, location, microphone, and tracking components are disabled via `Permissions-Policy`.
- **Enforced HTTPS**: `Strict-Transport-Security` enforces secure connections using HSTS headers.

Deployments should be audited using tools like [SecurityHeaders](https://securityheaders.com) and the [Mozilla Observatory](https://observatory.mozilla.org).

## Supply Chain & Audits

- Dependencies are locked via `package-lock.json` and compiled strictly using `npm ci`.
- We recommend scanning dependencies regularly with `npm audit` and checking commits for credentials leak patterns using tools like `gitleaks`.

## Reporting Flaws

To report security issues or concerns, contact the project owners directly rather than filing public issue threads.
