import {
  bilingualStaleAlert,
  stalePrograms,
  type StaleProgramRow,
} from '../packages/shared/src/rebates/stale-alert.ts';

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
} as const;

function rowsFromEnv(): StaleProgramRow[] {
  const raw = process.env.STALE_PROGRAMS_JSON;
  if (!raw) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('STALE_PROGRAMS_JSON must be an array');
  }
  return parsed.filter(isRow);
}

function isRow(value: unknown): value is StaleProgramRow {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const row = value as StaleProgramRow;
  return (
    typeof row.id === 'string' &&
    typeof row.nameFr === 'string' &&
    typeof row.nameEn === 'string' &&
    typeof row.isPublished === 'boolean' &&
    (row.lastVerifiedAt === null || typeof row.lastVerifiedAt === 'string')
  );
}

const mail = bilingualStaleAlert(stalePrograms(rowsFromEnv()), copy);
process.stdout.write(`${mail.subject}\n${mail.text}\n`);

const inbox = process.env.ADMIN_ALERT_EMAIL ?? '';
if (!inbox || inbox.endsWith('@example.com')) {
  process.stderr.write('BLOCKED: needs Brown mailbox (ADMIN_ALERT_EMAIL)\n');
}
