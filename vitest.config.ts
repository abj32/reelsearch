import { defineConfig } from 'vitest/config';

// Integration tests need Docker Postgres (`docker compose up -d --wait`); unit tests don't.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/reelsearch_test';

const shared = {
  setupFiles: ['server/test/setup.ts'],
  env: {
    JWT_SECRET: 'test-secret',
    OMDB_API_KEY: 'test-omdb-key',
    OPENAI_API_KEY: 'test-openai-key',
    DATABASE_URL: TEST_DATABASE_URL,
  },
};

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          ...shared,
          name: 'unit',
          include: ['server/**/*.test.ts'],
          exclude: ['server/**/*.integration.test.ts'],
        },
      },
      {
        test: {
          ...shared,
          name: 'integration',
          include: ['server/**/*.integration.test.ts'],
          globalSetup: ['server/test/globalSetup.ts'],
          fileParallelism: false, // files share one database
        },
      },
    ],
  },
});
