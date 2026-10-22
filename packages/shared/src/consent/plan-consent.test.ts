import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canGeneratePlan, consentProfileUpdate, TERMS_VERSION } from './plan-consent.ts';

const acceptedAt = '2026-10-22T18:00:00.000Z';

test('a plan cannot be generated without consent_ai_at', () => {
  assert.equal(canGeneratePlan({ consentAiAt: null }), false);
  assert.equal(canGeneratePlan({ consentAiAt: '' }), false);
  assert.equal(canGeneratePlan({ consentAiAt: '2026-10-22T18:00:00.000Z' }), true);
});

test('the stored terms version is the unpublished draft label', () => {
  assert.equal(TERMS_VERSION, '2026-10-draft');
});

test('terms and AI are both required before a profile update is written', () => {
  const accepted = { termsAccepted: true, aiAccepted: true, marketingAccepted: false };
  assert.equal(consentProfileUpdate({ ...accepted, termsAccepted: false }, acceptedAt), null);
  assert.equal(consentProfileUpdate({ ...accepted, aiAccepted: false }, acceptedAt), null);
  assert.equal(consentProfileUpdate(accepted, 'not-a-timestamp'), null);
  assert.deepEqual(consentProfileUpdate(accepted, acceptedAt), {
    consent_terms_version: '2026-10-draft',
    consent_terms_at: acceptedAt,
    consent_ai_at: acceptedAt,
    consent_marketing: false,
  });
});

test('marketing may stay unchecked and is stored when accepted', () => {
  const payload = consentProfileUpdate(
    { termsAccepted: true, aiAccepted: true, marketingAccepted: true },
    acceptedAt,
  );
  assert.equal(payload?.consent_marketing, true);
  assert.equal(payload?.consent_terms_version, TERMS_VERSION);
});
