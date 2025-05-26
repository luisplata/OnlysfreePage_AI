
import { BASE_API_URL } from '@/lib/api';
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
        hostname: 'simp6.jpg.church', // From /api/model/[id] example & /api/hot
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'simp4.jpg.church', // From /api/hot
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fs-01.cyberdrop.to', // From /api/ppv & /api/popular
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbs2.redgifs.com', // From /api/popular
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'z.zz.fo', // From /api/popular
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${BASE_API_URL}/:path*`,
      },
    ];
  },
  generateBuildId: async () => {
    // Genera un ID de compilación basado en la fecha y hora actual
    const dateString = new Date().toISOString();
    // Reemplaza los caracteres inválidos (:) con guiones (-)
    return dateString.replace(/:/g, '-');
  },  
};

export default nextConfig;
