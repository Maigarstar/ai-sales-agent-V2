/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... any other config you have
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // This covers your project URL
      },
    ],
  },
};

export default nextConfig;