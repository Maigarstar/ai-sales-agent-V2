/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: "/public/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/public/signup",
        destination: "/signup",
        permanent: true,
      },
      {
        source: "/public/forgot-password",
        destination: "/forgot-password",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
