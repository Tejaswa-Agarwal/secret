/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img.anify.tv' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'gogocdn.net' },
      { protocol: 'https', hostname: 'media.kitsu.app' },
    ],
  },
  // @consumet/extensions uses axios and cheerio which need these
  serverExternalPackages: ['@consumet/extensions'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default nextConfig;
