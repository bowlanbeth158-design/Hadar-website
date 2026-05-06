// Vitest config — exclut les tests Playwright e2e (qui tournent
// avec `npm run test:e2e` séparément).

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'tests/e2e/**',
    ],
  },
});
