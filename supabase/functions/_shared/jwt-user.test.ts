import { bearerToken, userFromAuthHeader } from './jwt-user.ts';

Deno.test('bearerToken reads the JWT and rejects a missing header', () => {
  if (bearerToken('Bearer abc.def') !== 'abc.def') {
    throw new Error('expected bearer token');
  }
  if (bearerToken(null) !== null || bearerToken('Basic x') !== null) {
    throw new Error('expected null');
  }
});

Deno.test('userFromAuthHeader uses the injected lookup', async () => {
  const user = await userFromAuthHeader('Bearer token-1', async (jwt) =>
    jwt === 'token-1' ? { id: 'owner-1' } : null,
  );
  if (user?.id !== 'owner-1') {
    throw new Error('expected owner');
  }
});
