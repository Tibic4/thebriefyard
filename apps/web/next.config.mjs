/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@briefyard/core', '@briefyard/content', '@briefyard/types'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
