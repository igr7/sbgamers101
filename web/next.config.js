/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
    ],
  },
  headers: async () => [
    {
      // All page routes - tell CDN to vary on RSC header
      source: '/((?!_next|api).*)',
      headers: [
        { key: 'Vary', value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch' },
      ],
    },
  ],
};

module.exports = nextConfig;
