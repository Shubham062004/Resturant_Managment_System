import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['node_modules/**', 'dist/**', '**/*.d.ts', 'src/tests/**'],
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
});
