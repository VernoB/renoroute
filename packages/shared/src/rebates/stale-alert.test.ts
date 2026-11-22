import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ADMIN_STALE_AFTER_DAYS } from './admin-catalog.ts';
import {
  bilingualStaleAlert,
  staleAlertsByProvince,
  stalePrograms,
  type StaleAlertCopy,
} from './stale-alert.ts';

const copy = {
  fr: {
    subject: 'Programmes à revérifier',
    intro: 'Non vérifiés depuis plus de 30 jours.',
    empty: 'Aucun programme périmé.',
    unpublished: 'non publié',
  },
  en: {
    subject: 'Programs to re-check',
    intro: 'Not verified for more than 30 days.',
    empty: 'No stale programs.',
    unpublished: 'unpublished',
  },
} as const satisfies Record<'fr' | 'en', StaleAlertCopy>;

test('the weekly list uses the 30-day window and stays bilingual', () => {
  assert.equal(ADMIN_STALE_AFTER_DAYS, 30);
  const now = new Date('2026-10-23T12:00:00.000Z');
  const stale = stalePrograms(
    [
      {
        id: 'fresh',
        nameFr: 'Récent',
        nameEn: 'Fresh',
        lastVerifiedAt: '2026-10-20',
        isPublished: true,
      },
      {
        id: 'old',
        nameFr: 'Toute la maison',
        nameEn: 'Total Home',
        lastVerifiedAt: '2026-09-01',
        isPublished: true,
      },
      {
        id: 'draft',
        nameFr: 'Brouillon',
        nameEn: 'Draft',
        lastVerifiedAt: null,
        isPublished: false,
      },
    ],
    now,
  );
  assert.deepEqual(
    stale.map((row) => row.id),
    ['old', 'draft'],
  );
  const mail = bilingualStaleAlert(stale, copy);
  assert.match(mail.subject, /Programmes à revérifier/);
  assert.match(mail.subject, /Programs to re-check/);
  assert.match(mail.text, /Toute la maison/);
  assert.match(mail.text, /Total Home/);
  assert.match(mail.text, /non publié/);
  assert.match(mail.text, /unpublished/);
  assert.equal(mail.text.includes('Récent'), false);
});

test('weekly alerts are split by province', () => {
  const now = new Date('2026-10-23T12:00:00.000Z');
  const alerts = staleAlertsByProvince(
    [
      {
        id: 'nb',
        nameFr: 'NB',
        nameEn: 'NB',
        lastVerifiedAt: null,
        isPublished: false,
        jurisdiction: 'NB',
      },
      {
        id: 'ns',
        nameFr: 'NS',
        nameEn: 'NS',
        lastVerifiedAt: null,
        isPublished: false,
        jurisdiction: 'NS',
      },
    ],
    copy,
    now,
  );
  assert.deepEqual(
    alerts.map((alert) => alert.jurisdiction),
    ['NB', 'NS'],
  );
  assert.match(alerts[0]?.text ?? '', /NB/);
  assert.equal((alerts[0]?.text ?? '').includes('\n- NS'), false);
});

test('an empty week still has French and English empty copy', () => {
  const mail = bilingualStaleAlert([], copy);
  assert.match(mail.text, /Aucun programme périmé/);
  assert.match(mail.text, /No stale programs/);
});
