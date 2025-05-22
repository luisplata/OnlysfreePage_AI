
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // From /api/packs
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'simp6.jpg.church', // From /api/model/[id] example
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fs-01.cyberdrop.to', // From /api/ppv
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://test.onlysfree.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
