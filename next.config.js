// eslint-disable-next-line @typescript-eslint/no-var-requires
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: `/xs.js`,
        destination: `${process.env.NEXT_PUBLIC_UMAMI_SRC}`
      },
      {
        source: `/api/send`,
        destination: `${process.env.NEXT_PUBLIC_UMAMI_API}`
      },
    ]
  },
  skipTrailingSlashRedirect: true,
  publicRuntimeConfig: {
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === 'development',
    workboxOptions: {
      disableDevLogs: true,
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './loader.js',
  },
};
module.exports = process.env.TURBO
  ? nextConfig
  : withBundleAnalyzer(withPWA(nextConfig));
