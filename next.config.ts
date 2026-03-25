import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.playstation.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.sonyentertainmentnetwork.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.playstation.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.playstation.net",
        pathname: "/**",
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    PSN_CLIENT_ID: process.env.PSN_CLIENT_ID,
    PSN_REDIRECT_URI: process.env.PSN_REDIRECT_URI,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Removemos a configuração experimental do turbo, pois não é mais suportada dessa forma no Next.js 14
  experimental: {
    // Deixe vazio ou adicione configurações experimentais válidas
  },
  // Habilitar source maps para debug
  productionBrowserSourceMaps: true,
  // Configurações de logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          }
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.webassemblyModuleFilename = '../static/wasm/[modulehash].wasm';
    }
    return config;
  }
};

export default nextConfig;