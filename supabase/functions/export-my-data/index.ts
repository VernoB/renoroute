import {
  parseExportPayload,
  type ExportPayload,
} from '../../../packages/shared/src/account/account.ts';

export type ExportStore = {
  email: (ownerId: string) => Promise<string | null>;
  profile: (ownerId: string) => Promise<ExportPayload['profile'] | null>;
  homes: (ownerId: string) => Promise<ExportPayload['homes']>;
  photos: (ownerId: string) => Promise<Array<{ id: string; category: string; storagePath: string }>>;
  signPhoto: (storagePath: string) => Promise<string | null>;
  assessments: (ownerId: string) => Promise<ExportPayload['assessments']>;
  plans: (ownerId: string) => Promise<ExportPayload['plans']>;
  payments: (ownerId: string) => Promise<ExportPayload['payments']>;
};

export type ExportMyDataResult =
  | { ok: true; payload: ExportPayload }
  | { ok: false; reason: 'forbidden' | 'invalid' };

export async function exportMyData(
  ownerId: string | null,
  store: ExportStore,
  now: Date = new Date(),
): Promise<ExportMyDataResult> {
  if (!ownerId) {
    return { ok: false, reason: 'forbidden' };
  }
  const profile = await store.profile(ownerId);
  if (!profile) {
    return { ok: false, reason: 'forbidden' };
  }
  const photos = await store.photos(ownerId);
  const signed = await Promise.all(
    photos.map(async (photo) => {
      const signedUrl = await store.signPhoto(photo.storagePath);
      return signedUrl ? { id: photo.id, category: photo.category, signedUrl } : null;
    }),
  );
  const raw = {
    exportedAt: now.toISOString(),
    profile: { ...profile, email: (await store.email(ownerId)) ?? profile.email },
    homes: await store.homes(ownerId),
    photos: signed.filter((row): row is NonNullable<typeof row> => row !== null),
    assessments: await store.assessments(ownerId),
    plans: await store.plans(ownerId),
    payments: await store.payments(ownerId),
  };
  const parsed = parseExportPayload(raw);
  return parsed.ok ? { ok: true, payload: parsed.value } : { ok: false, reason: 'invalid' };
}

export function exportMyDataResponse(result: ExportMyDataResult): Response {
  const status = result.ok ? 200 : result.reason === 'forbidden' ? 401 : 400;
  return Response.json(result, { status });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    return exportMyDataResponse(await serveExportMyData(request));
  });
}

export async function serveExportMyData(request: Request): Promise<ExportMyDataResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const { userFromAuthHeader } = await import('../_shared/jwt-user.ts');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');
  const userClient = createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const service = createClient(url, serviceKey);
  const user = await userFromAuthHeader(authHeader, async () => {
    const { data } = await userClient.auth.getUser();
    return data.user ? { id: data.user.id } : null;
  });
  return exportMyData(
    user?.id ?? null,
    createExportStore(
      userClient as unknown as LooseClient,
      service as unknown as LooseClient,
      user?.id ?? '',
    ),
  );
}

type LooseQuery = {
  select: (columns: string) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
  then?: unknown;
};

type LooseClient = {
  from: (table: string) => LooseQuery;
  auth: { admin: { getUserById: (id: string) => Promise<{ data: { user: { email?: string } | null } }> } };
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (path: string, expires: number) => Promise<{ data: { signedUrl?: string } | null }>;
    };
  };
};

function createExportStore(userClient: LooseClient, service: LooseClient, ownerId: string): ExportStore {
  return {
    async email() {
      const { data } = await service.auth.admin.getUserById(ownerId);
      return data.user?.email ?? null;
    },
    async profile() {
      const { data } = await userClient
        .from('profiles')
        .select(
          'id, preferred_locale, postal_code_fsa, consent_terms_at, consent_ai_at, consent_marketing',
        )
        .eq('id', ownerId)
        .maybeSingle();
      if (!data || typeof data.id !== 'string') {
        return null;
      }
      return {
        id: data.id,
        preferredLocale: data.preferred_locale === 'en' ? 'en' : 'fr',
        postalCodeFsa: typeof data.postal_code_fsa === 'string' ? data.postal_code_fsa : null,
        consentTermsAt: typeof data.consent_terms_at === 'string' ? data.consent_terms_at : null,
        consentAiAt: typeof data.consent_ai_at === 'string' ? data.consent_ai_at : null,
        consentMarketing: data.consent_marketing === true,
        email: null,
      };
    },
    async homes() {
      return listRows(userClient, 'homes', ownerId);
    },
    async photos() {
      const rows = await listRows(userClient, 'home_photos', ownerId);
      return rows.flatMap((row) => {
        if (typeof row.id !== 'string' || typeof row.category !== 'string' || typeof row.storage_path !== 'string') {
          return [];
        }
        return [{ id: row.id, category: row.category, storagePath: row.storage_path }];
      });
    },
    async signPhoto(storagePath) {
      const { data } = await service.storage.from('home-photos').createSignedUrl(storagePath, 120);
      return data?.signedUrl && data.signedUrl.startsWith('https://') ? data.signedUrl : null;
    },
    async assessments() {
      return listRows(userClient, 'assessments', ownerId);
    },
    async plans() {
      return listRows(userClient, 'plans', ownerId);
    },
    async payments() {
      const rows = await listRows(userClient, 'payments', ownerId);
      return rows.flatMap((row) => {
        if (typeof row.id !== 'string' || typeof row.product_code !== 'string' || typeof row.amount_cents !== 'number') {
          return [];
        }
        return [
          {
            id: row.id,
            productCode: row.product_code,
            amountCents: row.amount_cents,
            currency: typeof row.currency === 'string' ? row.currency : 'cad',
            status: typeof row.status === 'string' ? row.status : 'pending',
            provider: typeof row.provider === 'string' ? row.provider : null,
          },
        ];
      });
    },
  };
}

async function listRows(
  client: LooseClient,
  table: string,
  ownerId: string,
): Promise<Array<Record<string, unknown>>> {
  const query = client.from(table).select('*').eq('owner_id', ownerId) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
  }>;
  const { data } = await query;
  return data ?? [];
}
