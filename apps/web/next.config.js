/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL,
    JWT_SECRET: process.env.JWT_SECRET
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'snamizkalssemrhgaccl.supabase.co',
        pathname: '/storage/v1/**',
      }
    ],
  },
};

export default nextConfig;
