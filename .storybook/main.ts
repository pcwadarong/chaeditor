import type { StorybookConfig } from '@storybook/nextjs-vite';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  addons: [],
  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  viteFinal: async config => ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'default',
          icon: true,
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
      }),
    ],
  }),
};

export default config;
