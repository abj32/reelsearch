import { execSync } from 'node:child_process';

// Applies every migration to the test database before the integration tests run.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/reelsearch_test';
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: url },
    });
  } catch (err) {
    const out = (err as { stderr?: Buffer }).stderr?.toString() ?? '';
    throw new Error(`Could not migrate the test database. Is Postgres up (docker compose up -d --wait)?\n${out}`);
  }
}
