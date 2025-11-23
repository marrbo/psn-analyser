/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    
  },
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true
  },
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

module.exports = nextConfig