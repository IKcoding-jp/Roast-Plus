import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'app/**/page.tsx',
    'app/**/layout.tsx',
    'scripts/**/*.ts',
  ],
  project: ['**/*.{ts,tsx}'],
  ignore: [
    '**/*.test.{ts,tsx}',
    '**/*.d.ts',
    'functions/**',
    '.claude/**',
  ],
  ignoreDependencies: [
    'tailwindcss',
  ],
  next: {
    entry: [
      'app/**/page.tsx',
      'app/**/layout.tsx',
      'next.config.ts',
    ],
  },
  vitest: {
    entry: ['**/*.test.{ts,tsx}'],
  },
};

export default config;
