// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Required for Telegram Mini Apps
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

module.exports = nextConfig;
