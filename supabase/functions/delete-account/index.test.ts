import { remainingUserRows } from '../../../packages/shared/src/account/account.ts';

import { deleteAccount, type DeleteAccountStore } from './index.ts';

const ownerId = 'user-1';

function store(overrides: Partial<DeleteAccountStore> = {}): DeleteAccountStore {
  const state = {
    storage: [`${ownerId}/home-1/a.jpg`],
    homes: [{ ownerId }],
    photos: [{ ownerId }],
    assessments: [{ ownerId }],
    plans: [{ ownerId }],
    payments: [{ ownerId: ownerId as string | null }],
    deleted: false,
  };
  return {
    async listStorage() {
      return state.storage;
    },
    async removeStorage() {
      state.storage = [];
      state.photos = [];
    },
    async anonymizePayments() {
      state.payments = [{ ownerId: null }];
    },
    async deleteUser() {
      state.deleted = true;
      state.homes = [];
      state.assessments = [];
      state.plans = [];
    },
    async remaining() {
      return remainingUserRows(
        {
          homes: state.homes,
          photos: state.photos,
          assessments: state.assessments,
          plans: state.plans,
          storageObjects: state.storage.map(() => ({ ownerId })),
          payments: state.payments,
        },
        ownerId,
      );
    },
    ...overrides,
  };
}

Deno.test('delete-account requires the French confirmation phrase', async () => {
  const result = await deleteAccount(ownerId, 'DELETE', 'fr', store());
  if (result.ok !== false || result.reason !== 'invalid_confirmation') {
    throw new Error(`expected invalid_confirmation, got ${JSON.stringify(result)}`);
  }
});

Deno.test('delete-account wipes storage, anonymizes payments, and leaves no uid rows', async () => {
  const result = await deleteAccount(ownerId, 'SUPPRIMER', 'fr', store());
  if (result.ok !== true) {
    throw new Error(`expected ok, got ${JSON.stringify(result)}`);
  }
});

Deno.test('delete-account accepts the English DELETE phrase', async () => {
  const result = await deleteAccount(ownerId, 'DELETE', 'en', store());
  if (result.ok !== true) {
    throw new Error(`expected ok, got ${JSON.stringify(result)}`);
  }
});

Deno.test('delete-account refuses a missing session', async () => {
  const result = await deleteAccount(null, 'DELETE', 'en', store());
  if (result.ok !== false || result.reason !== 'forbidden') {
    throw new Error(`expected forbidden, got ${JSON.stringify(result)}`);
  }
});
