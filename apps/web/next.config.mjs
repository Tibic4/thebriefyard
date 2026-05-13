import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@briefyard/core', '@briefyard/content', '@briefyard/types'],
  experimental: {
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig);
