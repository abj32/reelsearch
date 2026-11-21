import { beforeEach, vi } from 'vitest';

// No test may reach OpenAI. Tests set the reply through server/test/providers.ts.
vi.mock('../lib/openai.js', () => ({
  openai: { responses: { create: vi.fn() } },
}));

// No test may reach a catalog provider. Tests that need one call mockCatalog().
beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Unmocked network call: use mockCatalog() from server/test/providers.ts');
  });
  vi.spyOn(console, 'error').mockImplementation(() => {}); // routes log expected failures
});
