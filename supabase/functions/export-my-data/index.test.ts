import { exportMyData, type ExportStore } from './index.ts';

const ownerId = 'user-1';

function store(overrides: Partial<ExportStore> = {}): ExportStore {
  return {
    async email() {
      return 'person@example.com';
    },
    async profile() {
      return {
        id: ownerId,
        preferredLocale: 'fr',
        postalCodeFsa: 'E1C',
        consentTermsAt: '2026-10-20T12:00:00.000Z',
        consentAiAt: '2026-10-20T12:00:00.000Z',
        consentMarketing: false,
        email: null,
      };
    },
    async homes() {
      return [{ id: 'home-1', owner_id: ownerId }];
    },
    async photos() {
      return [{ id: 'photo-1', category: 'exterior_front', storagePath: `${ownerId}/home-1/a.jpg` }];
    },
    async signPhoto() {
      return 'https://storage.example/signed';
    },
    async assessments() {
      return [{ id: 'a-1' }];
    },
    async plans() {
      return [{ id: 'plan-1' }];
    },
    async payments() {
      return [
        {
          id: 'pay-1',
          productCode: 'renoroute_plan_standard',
          amountCents: 4900,
          currency: 'cad',
          status: 'succeeded',
          provider: 'stripe',
        },
      ];
    },
    ...overrides,
  };
}

Deno.test('export-my-data returns a complete JSON pack with signed photo URLs', async () => {
  const result = await exportMyData(ownerId, store());
  if (result.ok !== true) {
    throw new Error(`expected ok, got ${JSON.stringify(result)}`);
  }
  if (result.payload.profile.email !== 'person@example.com') {
    throw new Error('email missing from export');
  }
  if (result.payload.photos[0]?.signedUrl !== 'https://storage.example/signed') {
    throw new Error('signed photo URL missing');
  }
  if (result.payload.payments.length !== 1 || result.payload.homes.length !== 1) {
    throw new Error('export was incomplete');
  }
});

Deno.test('export-my-data refuses a missing session', async () => {
  const result = await exportMyData(null, store());
  if (result.ok !== false || result.reason !== 'forbidden') {
    throw new Error(`expected forbidden, got ${JSON.stringify(result)}`);
  }
});
