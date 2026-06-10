import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Configure Vitest testing parameters for logic tests.
 * Coverage is scoped to only the files exercised by the test suite.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/shapEngine.ts',
        'src/lib/twinRegression.ts',
        'src/utils/rateLimiter.ts',
        'src/utils/sanitize.ts',
        'src/utils/validators.ts',
      ],
      exclude: ['src/tests/**', '**/*.d.ts', '**/*.config.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
      reporter: ['text', 'json', 'html'],
    },
  },
});
