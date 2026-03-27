import type { NextConfig } from 'next';

const config: NextConfig = {
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  async rewrites() {
    // Proxy /api/* → FastAPI backend (strips /api prefix)
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL ?? 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

export default config;
