
import type {NextConfig} from 'next';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'export', // OBRIGATÓRIO para gerar arquivos estáticos para o APK (Capacitor)
  distDir: 'out',
  // ESLint: Enable linting during builds
  eslint: {
    // Remove: ignoreDuringBuilds: true
    dirs: ['src'],
  },
  images: {
    unoptimized: true, // Vital para garantir que as imagens funcionem offline
  },
  transpilePackages: [
    '@tensorflow-models/pose-detection',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-converter',
    '@mediapipe/pose',
    '@google/generative-ai'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mediapipe/pose': path.resolve(process.cwd(), 'src/lib/mediapipe-shim.ts'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@mediapipe/pose': './src/lib/mediapipe-shim.ts',
    },
  },
};

export default nextConfig;
