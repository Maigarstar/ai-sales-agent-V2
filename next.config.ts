import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  outputFileTracingExcludes: { "*": ["./theme_archive/**"] },
  serverExternalPackages: [],
};

export default nextConfig;
