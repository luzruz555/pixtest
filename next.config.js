/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2doj8oszwtcqy.cloudfront.net',
      },
    ],
  },
}

module.exports = nextConfig
