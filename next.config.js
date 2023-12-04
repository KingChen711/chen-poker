/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*'
      },
      {
        protocol: 'http',
        hostname: '*'
      }
    ]
  },
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ['mongoose']
  }
}

module.exports = nextConfig
