import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server.js';

vi.stubEnv('VITE_API_BASE_URL', 'http://localhost/api/');
vi.stubEnv('VITE_API_KEY', 'test-api-key');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
