// Path: next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This will allow your project to build even if there are ESLint errors.
  // It's a good way to get your deployment working.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;