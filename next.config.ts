import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Use this only if you're in the `app/` directory structure
  experimental: {
    serverActions: { bodySizeLimit: '1mb', allowedOrigins: [] }, // Adjust as needed
  },
  // If you're using images in public folder
  images: {
    domains: [], // Add external domains if you use external images
  },
  reactStrictMode: true,
};

export default nextConfig;
