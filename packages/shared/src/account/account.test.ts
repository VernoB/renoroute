import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  accountLocaleUpdate,
  deleteConfirmPhrase,
  isAccountGone,
  isDeleteConfirmed,
  marketingConsentUpdate,
  parseExportPayload,
  remainingUserRows,
  withdrawAiConsent,
} from './account.ts';

test('French and English delete phrases are exact and case-sensitive', () => {
  assert.equal(deleteConfirmPhrase('fr'), 'SUPPRIMER');
  assert.equal(deleteConfirmPhrase('en'), 'DELETE');
  assert.equal(isDeleteConfirmed('SUPPRIMER', 'fr'), true);
  assert.equal(isDeleteConfirmed('DELETE', 'en'), true);
  assert.equal(isDeleteConfirmed('supprimer', 'fr'), false);
  assert.equal(isDeleteConfirmed('delete', 'en'), false);
  assert.equal(isDeleteConfirmed('SUPPRIMER', 'en'), false);
});

test('withdrawing AI consent and changing locale stay typed', () => {
  assert.deepEqual(withdrawAiConsent(), { consent_ai_at: null });
  assert.deepEqual(marketingConsentUpdate(false), { consent_marketing: false });
  assert.deepEqual(accountLocaleUpdate('en'), { preferred_locale: 'en' });
});

test('a complete bilingual export keeps signed photo URLs and payment amounts', () => {
  const parsed = parseExportPayload({
    exportedAt: '2026-10-23T12:00:00.000Z',
    profile: {
      id: 'user-1',
      preferredLocale: 'fr',
      postalCodeFsa: 'E1C',
      consentTermsAt: '2026-10-20T12:00:00.000Z',
      consentAiAt: '2026-10-20T12:00:00.000Z',
      consentMarketing: false,
      email: 'person@example.com',
    },
    homes: [{ id: 'home-1' }],
    photos: [
      {
        id: 'photo-1',
        category: 'exterior_front',
        signedUrl: 'https://storage.example/signed',
      },
    ],
    assessments: [{ id: 'a-1' }],
    plans: [{ id: 'plan-1' }],
    payments: [
      {
        id: 'pay-1',
        productCode: 'renoroute_plan_standard',
        amountCents: 4900,
        currency: 'cad',
        status: 'succeeded',
        provider: 'stripe',
      },
    ],
  });
  assert.equal(parsed.ok, true);
  assert.equal(parseExportPayload({ profile: {} }).ok, false);
});

test('after delete no identified rows remain for the uid', () => {
  const left = remainingUserRows(
    {
      homes: [{ ownerId: 'other' }],
      photos: [],
      assessments: [],
      plans: [],
      storageObjects: [],
      payments: [{ ownerId: null }],
    },
    'user-1',
  );
  assert.equal(isAccountGone(left), true);
  assert.equal(
    isAccountGone(
      remainingUserRows(
        {
          homes: [{ ownerId: 'user-1' }],
          photos: [],
          assessments: [],
          plans: [],
          storageObjects: [],
          payments: [{ ownerId: 'user-1' }],
        },
        'user-1',
      ),
    ),
    false,
  );
});
