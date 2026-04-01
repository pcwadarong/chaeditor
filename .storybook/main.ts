import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  addons: [],
  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
};

export default config;
