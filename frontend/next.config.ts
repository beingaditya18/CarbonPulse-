import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' blob: data: *.googleapis.com *.gstatic.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.googleapis.com *.google.com",
      "frame-ancestors 'none'"
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      return [
        {
          source: "/_/backend/:path*",
          destination: "http://127.0.0.1:8000/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;
