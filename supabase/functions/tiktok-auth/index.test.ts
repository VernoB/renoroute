import {
  completeTikTokAuth,
  isVerifiedEmail,
  parseTikTokAuthInput,
  type TikTokAuthStore,
  type TikTokProfile,
} from './index.ts';

const input = {
  code: 'tt-code',
  codeVerifier: 'tt-verifier',
  redirectUri: 'renoroute://auth/callback',
};

const profile: TikTokProfile = {
  openId: 'open-1',
  email: 'owner@example.com',
  emailVerified: true,
  displayName: 'Owner',
};

function store(overrides: Partial<TikTokAuthStore> = {}): TikTokAuthStore {
  const users: { id: string; email: string; emailVerified: boolean; openId?: string }[] = [];
  return {
    async exchangeCode() {
      return { ok: true, accessToken: 'tt-access' };
    },
    async fetchProfile() {
      return profile;
    },
    async findUserByOpenId(openId) {
      const match = users.find((user) => user.openId === openId);
      return match ? { id: match.id } : null;
    },
    async findUserByEmail(email) {
      const match = users.find((user) => user.email === email);
      return match ? { id: match.id, emailVerified: match.emailVerified } : null;
    },
    async createUser(created) {
      users.push({
        id: 'user-new',
        email: created.email,
        emailVerified: true,
        openId: created.openId,
      });
      return { id: 'user-new' };
    },
    async linkOpenId(userId, openId) {
      const match = users.find((user) => user.id === userId);
      if (match) {
        match.openId = openId;
      }
    },
    async createSession(userId) {
      return { accessToken: `access-${userId}`, refreshToken: `refresh-${userId}` };
    },
    ...overrides,
  };
}

Deno.test('tiktok-auth rejects a body without a PKCE code', () => {
  if (parseTikTokAuthInput({ code: '', codeVerifier: 'x', redirectUri: 'https://evil.example' })) {
    throw new Error('expected invalid input');
  }
});

Deno.test('tiktok-auth creates a session for a new verified email', async () => {
  const result = await completeTikTokAuth(input, store(), true);
  if (!result.ok || result.accessToken !== 'access-user-new') {
    throw new Error(`expected new session, got ${JSON.stringify(result)}`);
  }
});

Deno.test('tiktok-auth links a verified email that already exists', async () => {
  const linked = store({
    async findUserByEmail() {
      return { id: 'user-existing', emailVerified: true };
    },
  });
  const result = await completeTikTokAuth(input, linked, true);
  if (!result.ok || result.accessToken !== 'access-user-existing') {
    throw new Error(`expected linked session, got ${JSON.stringify(result)}`);
  }
});

Deno.test('tiktok-auth refuses an unverified existing email', async () => {
  const result = await completeTikTokAuth(
    input,
    store({
      async findUserByEmail() {
        return { id: 'user-existing', emailVerified: false };
      },
    }),
    true,
  );
  if (result.ok || result.reason !== 'email_exists') {
    throw new Error(`expected email_exists, got ${JSON.stringify(result)}`);
  }
});

Deno.test('tiktok-auth refuses a TikTok profile without an email', async () => {
  const result = await completeTikTokAuth(
    input,
    store({
      async fetchProfile() {
        return { openId: 'open-1', email: null, emailVerified: false, displayName: null };
      },
    }),
    true,
  );
  if (result.ok || result.reason !== 'email_missing') {
    throw new Error(`expected email_missing, got ${JSON.stringify(result)}`);
  }
});

Deno.test('tiktok-auth maps a denied token exchange', async () => {
  const result = await completeTikTokAuth(
    input,
    store({
      async exchangeCode() {
        return { ok: false, reason: 'denied' };
      },
    }),
    true,
  );
  if (result.ok || result.reason !== 'denied') {
    throw new Error(`expected denied, got ${JSON.stringify(result)}`);
  }
});

Deno.test('tiktok-auth stays unconfigured without Brown secrets', async () => {
  const result = await completeTikTokAuth(input, store(), false);
  if (result.ok || result.reason !== 'unconfigured') {
    throw new Error(`expected unconfigured, got ${JSON.stringify(result)}`);
  }
  if (isVerifiedEmail('not-an-email')) {
    throw new Error('invalid email passed');
  }
});
