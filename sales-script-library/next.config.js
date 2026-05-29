/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => `build-${Date.now()}`,
  // Canonical host: send www → apex so users never straddle two hosts
  // (host-only cookies don't transfer between them). The `has` host guard
  // means this only fires on the production www domain, not localhost/previews.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.tamlyhocvn.club' }],
        destination: 'https://tamlyhocvn.club/:path*',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
