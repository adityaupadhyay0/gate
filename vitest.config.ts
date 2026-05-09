import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
