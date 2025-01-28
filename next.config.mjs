import withPWAInit from '@ducanh2912/next-pwa';
import NextBundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const withPWA = withPWAInit({
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
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const withMDX = createMDX();

//TODO: change n8n domain
const cspHeader = `
    default-src 'self' https://umami.finalphase.app https://supabase.finalphase.app wss://supabase.finalphase.app https://n8n-hc0sc0wskgo4cckgck8ks8ss.finalphase.app;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://umami.finalphase.app https://js.stripe.com blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' avatars.githubusercontent.com lh3.googleusercontent.com blob: data: https://*.stripe.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://checkout.stripe.com https://js.stripe.com;
    frame-src 'self' https://checkout.stripe.com;
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
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};
export default process.env.TURBO
  ? withMDX(nextConfig)
  : withMDX(withBundleAnalyzer(withPWA(nextConfig)));
