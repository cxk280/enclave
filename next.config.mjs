const isDev = process.env.NODE_ENV !== "production";

/*
 * Content-Security-Policy that ENFORCES the sovereignty claim rather than just
 * displaying it. `connect-src 'self'` blocks any fetch/XHR/WebSocket to a
 * third-party host at the browser level, so "Egress: none" is a control, not
 * copy — a stray or dependency-injected external call is refused, not silently
 * made. Fonts are self-hosted (font-src 'self'); no third-party images/scripts.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for a minimal container image.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
