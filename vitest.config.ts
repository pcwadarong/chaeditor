import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      name: 'vitest-svg-raw-mock',
      resolveId(id) {
        if (id.endsWith('.svg?raw')) {
          return '\0chaeditor-svg-raw-mock';
        }

        return null;
      },
      load(id) {
        if (id === '\0chaeditor-svg-raw-mock') {
          return 'export default \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 8h12" /></svg>\';';
        }

        return null;
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: /^styled-system\/(.*)$/,
        replacement: path.resolve(__dirname, './styled-system/$1'),
      },
      {
        find: 'server-only',
        replacement: path.resolve(__dirname, './src/shared/lib/test/server-only.ts'),
      },
      {
        find: /\.svg$/,
        replacement: path.resolve(__dirname, './src/shared/lib/test/svg-component.tsx'),
      },
      {
        find: /\.svg\?url$/,
        replacement: path.resolve(__dirname, './src/shared/lib/test/svg-mock-url.ts'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    maxWorkers: 1,
    clearMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
