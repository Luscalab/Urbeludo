
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'export', // Habilita exportação estática para APK Offline
  distDir: 'out',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Necessário para output: export
  },
  transpilePackages: [
    '@tensorflow-models/pose-detection',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-converter',
    '@mediapipe/pose'
  ],
  experimental: {
    turbo: {
      resolveAlias: {
        '@mediapipe/pose': './src/lib/mediapipe-shim.ts',
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mediapipe/pose': path.resolve(process.cwd(), 'src/lib/mediapipe-shim.ts'),
    };
    return config;
  },
};

export default nextConfig;
