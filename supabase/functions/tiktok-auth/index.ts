export type TikTokAuthInput = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

export type TikTokProfile = {
  openId: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
};

export type TikTokAuthResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | {
      ok: false;
      reason: 'invalid' | 'denied' | 'email_exists' | 'email_missing' | 'provider' | 'unconfigured';
    };

export type TikTokAuthStore = {
  exchangeCode: (
    input: TikTokAuthInput,
  ) => Promise<{ ok: true; accessToken: string } | { ok: false; reason: 'denied' | 'provider' }>;
  fetchProfile: (accessToken: string) => Promise<TikTokProfile | null>;
  findUserByOpenId: (openId: string) => Promise<{ id: string } | null>;
  findUserByEmail: (email: string) => Promise<{ id: string; emailVerified: boolean } | null>;
  createUser: (input: {
    email: string;
    openId: string;
    displayName: string | null;
  }) => Promise<{ id: string }>;
  linkOpenId: (userId: string, openId: string) => Promise<void>;
  createSession: (userId: string) => Promise<{ accessToken: string; refreshToken: string } | null>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseTikTokAuthInput(body: unknown): TikTokAuthInput | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const record = body as Record<string, unknown>;
  const code = typeof record.code === 'string' ? record.code.trim() : '';
  const codeVerifier = typeof record.codeVerifier === 'string' ? record.codeVerifier.trim() : '';
  const redirectUri = typeof record.redirectUri === 'string' ? record.redirectUri.trim() : '';
  if (!code || !codeVerifier || !redirectUri.startsWith('renoroute://')) {
    return null;
  }
  return { code, codeVerifier, redirectUri };
}

export function isVerifiedEmail(value: string | null | undefined): value is string {
  return Boolean(value && EMAIL_PATTERN.test(value));
}

export async function completeTikTokAuth(
  input: TikTokAuthInput | null,
  store: TikTokAuthStore,
  configured: boolean,
): Promise<TikTokAuthResult> {
  if (!configured) {
    return { ok: false, reason: 'unconfigured' };
  }
  if (!input) {
    return { ok: false, reason: 'invalid' };
  }
  const exchanged = await store.exchangeCode(input);
  if (!exchanged.ok) {
    return { ok: false, reason: exchanged.reason };
  }
  const profile = await store.fetchProfile(exchanged.accessToken);
  if (!profile?.openId) {
    return { ok: false, reason: 'provider' };
  }
  const existingOpenId = await store.findUserByOpenId(profile.openId);
  if (existingOpenId) {
    return sessionFor(existingOpenId.id, store);
  }
  if (!isVerifiedEmail(profile.email) || !profile.emailVerified) {
    return { ok: false, reason: 'email_missing' };
  }
  const existingEmail = await store.findUserByEmail(profile.email);
  if (existingEmail) {
    if (!existingEmail.emailVerified) {
      return { ok: false, reason: 'email_exists' };
    }
    await store.linkOpenId(existingEmail.id, profile.openId);
    return sessionFor(existingEmail.id, store);
  }
  const created = await store.createUser({
    email: profile.email,
    openId: profile.openId,
    displayName: profile.displayName,
  });
  return sessionFor(created.id, store);
}

export function tiktokAuthResponse(result: TikTokAuthResult): Response {
  if (result.ok) {
    return Response.json(
      { ok: true, access_token: result.accessToken, refresh_token: result.refreshToken },
      { status: 200 },
    );
  }
  const status =
    result.reason === 'unconfigured' ? 503 : result.reason === 'denied' ? 403 : 400;
  return Response.json({ ok: false, reason: result.reason }, { status });
}

async function sessionFor(userId: string, store: TikTokAuthStore): Promise<TikTokAuthResult> {
  const session = await store.createSession(userId);
  if (!session) {
    return { ok: false, reason: 'provider' };
  }
  return { ok: true, accessToken: session.accessToken, refreshToken: session.refreshToken };
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return tiktokAuthResponse({ ok: false, reason: 'invalid' });
    }
    return tiktokAuthResponse(await serveTikTokAuth(body));
  });
}

export async function serveTikTokAuth(body: unknown): Promise<TikTokAuthResult> {
  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY') ?? Deno.env.get('EXPO_PUBLIC_TIKTOK_CLIENT_KEY') ?? '';
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET') ?? '';
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const configured =
    !isPlaceholder(clientKey) && !isPlaceholder(clientSecret) && Boolean(url && serviceKey);
  return completeTikTokAuth(parseTikTokAuthInput(body), liveStore(clientKey, clientSecret, url, serviceKey), configured);
}

function isPlaceholder(value: string): boolean {
  return value.trim().length === 0 || value.startsWith('replace-');
}

function liveStore(
  clientKey: string,
  clientSecret: string,
  supabaseUrl: string,
  serviceKey: string,
): TikTokAuthStore {
  return {
    async exchangeCode(input) {
      const token = await tiktokForm('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: clientKey,
        client_secret: clientSecret,
        code: input.code,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
        code_verifier: input.codeVerifier,
      });
      if (token.error === 'access_denied') {
        return { ok: false, reason: 'denied' };
      }
      const accessToken = typeof token.access_token === 'string' ? token.access_token : '';
      return accessToken ? { ok: true, accessToken } : { ok: false, reason: 'provider' };
    },
    async fetchProfile(accessToken) {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,email',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as {
        data?: { user?: { open_id?: string; display_name?: string; email?: string } };
      };
      const user = payload.data?.user;
      if (!user?.open_id) {
        return null;
      }
      return {
        openId: user.open_id,
        email: user.email ?? null,
        emailVerified: Boolean(user.email),
        displayName: user.display_name ?? null,
      };
    },
    async findUserByOpenId(openId) {
      const users = await listUsers(supabaseUrl, serviceKey);
      const match = users.find((user) => user.user_metadata?.tiktok_open_id === openId);
      return match ? { id: match.id } : null;
    },
    async findUserByEmail(email) {
      const users = await listUsers(supabaseUrl, serviceKey);
      const match = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
      if (!match) {
        return null;
      }
      return { id: match.id, emailVerified: Boolean(match.email_confirmed_at) };
    },
    async createUser(input) {
      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const service = createClient(supabaseUrl, serviceKey);
      const { data, error } = await service.auth.admin.createUser({
        email: input.email,
        email_confirm: true,
        user_metadata: { tiktok_open_id: input.openId, name: input.displayName },
      });
      if (error || !data.user) {
        throw new Error('create_failed');
      }
      return { id: data.user.id };
    },
    async linkOpenId(userId, openId) {
      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const service = createClient(supabaseUrl, serviceKey);
      const existing = await service.auth.admin.getUserById(userId);
      const { error } = await service.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...(existing.data.user?.user_metadata ?? {}),
          tiktok_open_id: openId,
        },
      });
      if (error) {
        throw new Error('link_failed');
      }
    },
    async createSession(userId) {
      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const service = createClient(supabaseUrl, serviceKey);
      const users = await listUsers(supabaseUrl, serviceKey);
      const email = users.find((user) => user.id === userId)?.email;
      if (!email) {
        return null;
      }
      const { data, error } = await service.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });
      const tokenHash = data.properties?.hashed_token;
      if (error || !tokenHash) {
        return null;
      }
      const verified = await service.auth.verifyOtp({ type: 'email', token_hash: tokenHash });
      const session = verified.data.session;
      if (!session) {
        return null;
      }
      return { accessToken: session.access_token, refreshToken: session.refresh_token };
    },
  };
}

async function listUsers(
  supabaseUrl: string,
  serviceKey: string,
): Promise<
  {
    id: string;
    email?: string | undefined;
    email_confirmed_at?: string | undefined;
    user_metadata?: { tiktok_open_id?: string };
  }[]
> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const service = createClient(supabaseUrl, serviceKey);
  const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    return [];
  }
  return data.users;
}

async function tiktokForm(url: string, fields: Record<string, string>): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return { error: 'provider' };
  }
}
