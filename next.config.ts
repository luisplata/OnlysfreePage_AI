import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // <-- Añadido para habilitar la exportación estática
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // <-- Añadido para deshabilitar la optimización de imágenes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
