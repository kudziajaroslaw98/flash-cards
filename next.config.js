// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const cspHeader = `
    default-src 'self' https://umami.finalphase.app https://supabase.finalphase.app https://supabase.finalphase.app/auth/v1/token?grant_type=refresh_token wss://supabase.finalphase.app;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://umami.finalphase.app;
    style-src 'self' 'unsafe-eval' 'unsafe-inline';
    img-src 'self' avatars.githubusercontent.com lh3.googleusercontent.com blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: `/xs.js`,
        destination: `${process.env.NEXT_PUBLIC_UMAMI_SRC}`,
      },
      {
        source: `/api/send`,
        destination: `${process.env.NEXT_PUBLIC_UMAMI_API}`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};
module.exports = process.env.TURBO
  ? nextConfig
  : withBundleAnalyzer(withPWA(nextConfig));
