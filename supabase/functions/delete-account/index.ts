import {
  isAccountGone,
  isDeleteConfirmed,
  remainingUserRows,
  type RemainingUserRows,
} from '../../../packages/shared/src/account/account.ts';
import type { AppLocale } from '../../../packages/shared/src/i18n/locale.ts';

export type DeleteAccountStore = {
  listStorage: (ownerId: string) => Promise<string[]>;
  removeStorage: (paths: readonly string[]) => Promise<void>;
  anonymizePayments: (ownerId: string) => Promise<void>;
  deleteUser: (ownerId: string) => Promise<void>;
  remaining: (ownerId: string) => Promise<RemainingUserRows>;
};

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: 'forbidden' | 'invalid_confirmation' | 'incomplete' };

export async function deleteAccount(
  ownerId: string | null,
  confirmation: string,
  locale: AppLocale,
  store: DeleteAccountStore,
): Promise<DeleteAccountResult> {
  if (!ownerId) {
    return { ok: false, reason: 'forbidden' };
  }
  if (!isDeleteConfirmed(confirmation, locale)) {
    return { ok: false, reason: 'invalid_confirmation' };
  }
  const paths = await store.listStorage(ownerId);
  await store.removeStorage(paths);
  await store.anonymizePayments(ownerId);
  await store.deleteUser(ownerId);
  const left = await store.remaining(ownerId);
  return isAccountGone(left) ? { ok: true } : { ok: false, reason: 'incomplete' };
}

export function deleteAccountResponse(result: DeleteAccountResult): Response {
  const status = result.ok ? 200 : result.reason === 'forbidden' ? 401 : 400;
  return Response.json(result, { status });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return deleteAccountResponse({ ok: false, reason: 'invalid_confirmation' });
    }
    return deleteAccountResponse(await serveDeleteAccount(request, body));
  });
}

export async function serveDeleteAccount(
  request: Request,
  body: unknown,
): Promise<DeleteAccountResult> {
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
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const locale: AppLocale = payload.locale === 'en' ? 'en' : 'fr';
  const confirmation = typeof payload.confirmation === 'string' ? payload.confirmation : '';
  return deleteAccount(
    user?.id ?? null,
    confirmation,
    locale,
    createDeleteStore(service as unknown as LooseClient, user?.id ?? ''),
  );
}

type LooseQuery = {
  select: (columns: string) => LooseQuery;
  update: (row: unknown) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  like: (column: string, value: unknown) => LooseQuery;
};

type LooseClient = {
  from: (table: string) => LooseQuery;
  auth: { admin: { deleteUser: (id: string) => Promise<{ error: { message: string } | null }> } };
  storage: {
    from: (bucket: string) => {
      list: (path: string, options: { limit: number }) => Promise<{ data: Array<{ name: string }> | null }>;
      remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
    };
  };
};

function createDeleteStore(service: LooseClient, ownerId: string): DeleteAccountStore {
  return {
    async listStorage() {
      const photos = await listOwned(service, 'home_photos', ownerId);
      return photos.flatMap((row) => (typeof row.storage_path === 'string' ? [row.storage_path] : []));
    },
    async removeStorage(paths) {
      if (paths.length === 0) {
        return;
      }
      await service.storage.from('home-photos').remove([...paths]);
    },
    async anonymizePayments() {
      await service.from('payments').update({ owner_id: null }).eq('owner_id', ownerId);
    },
    async deleteUser() {
      await service.auth.admin.deleteUser(ownerId);
    },
    async remaining() {
      const [homes, photos, assessments, plans, payments] = await Promise.all([
        listOwned(service, 'homes', ownerId),
        listOwned(service, 'home_photos', ownerId),
        listOwned(service, 'assessments', ownerId),
        listOwned(service, 'plans', ownerId),
        listOwned(service, 'payments', ownerId),
      ]);
      return remainingUserRows(
        {
          homes: homes.map(() => ({ ownerId })),
          photos: photos.map(() => ({ ownerId })),
          assessments: assessments.map(() => ({ ownerId })),
          plans: plans.map(() => ({ ownerId })),
          storageObjects: photos.map(() => ({ ownerId })),
          payments: payments.map((row) => ({
            ownerId: typeof row.owner_id === 'string' ? row.owner_id : null,
          })),
        },
        ownerId,
      );
    },
  };
}

async function listOwned(
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
