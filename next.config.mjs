/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_STATIC === 'true';

const nextConfig = {
  reactStrictMode: true,
  output: isExport ? 'export' : undefined,
  basePath: isExport ? '/fang001' : '',
  assetPrefix: isExport ? '/fang001/' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
