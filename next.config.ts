import path from 'path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    domains: ['assets.ppy.sh'],
  },
  webpack: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: { ...config.resolve?.alias, '@locale': path.resolve(__dirname, 'src/locale') }
    }
  })
};

export default config;