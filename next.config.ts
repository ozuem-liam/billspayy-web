import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Extract origin (scheme + host) from the API URL for CSP connect-src
function apiOrigin(url: string): string {
  try {
    const { origin } = new URL(url);
    return origin;
  } catch {
    return url;
  }
}

const cspHeader = [
  "default-src 'self'",
  // Scripts: self + Next.js inline runtime (unsafe-inline needed for App Router)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Styles: self + inline (Tailwind generates inline styles)
  "style-src 'self' 'unsafe-inline'",
  // Images: self + Google profile photos + vtpass service logos
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://vtpass.com",
  // API calls
  `connect-src 'self' ${apiOrigin(API_URL)}`,
  // Fonts
  "font-src 'self'",
  // No iframes
  "frame-src 'none'",
  // No plugins
  "object-src 'none'",
  // Restrict base URI to self
  "base-uri 'self'",
  // Only HTTPS for form actions
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "vtpass.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
