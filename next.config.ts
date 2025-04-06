/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Ensure you're using the App Router
    turbo: true, // Disable Turbopack if causing issues
  },
};

export default nextConfig;
