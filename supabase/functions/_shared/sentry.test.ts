import { initFunctionSentry } from './sentry.ts';

Deno.test('function Sentry stays idle without a DSN', async () => {
  Deno.env.delete('SENTRY_DSN');
  await initFunctionSentry();
  if (Deno.env.get('SENTRY_DSN') !== undefined) {
    throw new Error('SENTRY_DSN should stay unset');
  }
});
