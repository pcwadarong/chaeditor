import type { NextConfig } from 'next';
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;
const svgrLoader = {
  loader: '@svgr/webpack',
  options: {
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
      ],
    },
  },
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'velog.velcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      ...(supabaseHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
              pathname: '/storage/v1/object/public/**',
            },
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
              pathname: '/storage/v1/object/sign/**',
            },
          ]
        : []),
    ],
  },
  // Webpack (production)
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) => rule.test?.test?.('.svg'));

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] },
        use: [svgrLoader],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
  // Turbopack (development)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [svgrLoader],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
