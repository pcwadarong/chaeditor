import type { Preview } from '@storybook/nextjs-vite';

import '../styled-system/styles.css';

const viewportOptions = {
  desktop: {
    name: 'Desktop',
    styles: {
      height: '1080px',
      width: '1440px',
    },
    type: 'desktop',
  },
  laptop: {
    name: 'Laptop',
    styles: {
      height: '900px',
      width: '1280px',
    },
    type: 'desktop',
  },
  tablet: {
    name: 'Tablet',
    styles: {
      height: '1024px',
      width: '834px',
    },
    type: 'tablet',
  },
  mobile: {
    name: 'Mobile',
    styles: {
      height: '844px',
      width: '390px',
    },
    type: 'mobile',
  },
} as const;

const preview: Preview = {
  globalTypes: {
    backgroundTone: {
      defaultValue: 'light',
      description: 'Select the canvas background used by reference stories.',
      toolbar: {
        dynamicTitle: true,
        icon: 'mirror',
        items: [
          { title: 'Light canvas', value: 'light' },
          { title: 'Dark canvas', value: 'dark' },
        ],
      },
    },
  },
  parameters: {
    backgrounds: {
      default: 'light',
      options: {
        dark: { name: 'Dark canvas', value: '#111827' },
        light: { name: 'Light canvas', value: '#f8fafc' },
      },
    },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Reference'],
      },
    },
    viewport: {
      defaultViewport: 'desktop',
      options: viewportOptions,
    },
  },
};

export default preview;
