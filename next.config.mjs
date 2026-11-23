/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs', 'pdfkit', 'sharp'],
    outputFileTracingIncludes: {
      '/**': ['./node_modules/pdfkit/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com',
      },
    ],
  },
};

export default nextConfig;
