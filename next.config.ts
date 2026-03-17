const remotePatterns: Array<{
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
}> = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: '**.trycloudflare.com',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: '**.trycloudflare.com',
    pathname: '/**',
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    remotePatterns.push({
      protocol: parsed.protocol === 'http:' ? 'http' : 'https',
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/**',
    });
  } catch {
    // ignore malformed NEXT_PUBLIC_API_URL
  }
}

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

module.exports = nextConfig;
