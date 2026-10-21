import { healthBody, healthResponse } from './index.ts';

Deno.test('health body reports ok', () => {
  if (healthBody().ok !== true) {
    throw new Error('health body was not ok');
  }
});

Deno.test('health response is JSON ok', async () => {
  const response = healthResponse();
  if (response.headers.get('content-type')?.includes('application/json') !== true) {
    throw new Error('health response was not JSON');
  }
  const body = (await response.json()) as { ok?: boolean };
  if (body.ok !== true) {
    throw new Error('health response was not ok');
  }
});
