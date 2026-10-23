import { ADMIN_STALE_AFTER_DAYS, isVerificationStale } from './admin-catalog.ts';

export type StaleProgramRow = {
  id: string;
  nameFr: string;
  nameEn: string;
  lastVerifiedAt: string | null;
  isPublished: boolean;
};

export type StaleAlertCopy = {
  subject: string;
  intro: string;
  empty: string;
  unpublished: string;
};

export function stalePrograms(
  rows: readonly StaleProgramRow[],
  now: Date = new Date(),
  staleAfterDays: number = ADMIN_STALE_AFTER_DAYS,
): StaleProgramRow[] {
  return rows.filter((row) => isVerificationStale(row.lastVerifiedAt, now, staleAfterDays));
}

export function staleAlertBody(rows: readonly StaleProgramRow[], copy: StaleAlertCopy): string {
  if (rows.length === 0) {
    return [copy.subject, copy.empty].join('\n');
  }
  const lines = rows.map((row) => {
    const verified = row.lastVerifiedAt ?? '—';
    const flag = row.isPublished ? '' : ` (${copy.unpublished})`;
    return `- ${row.nameFr} / ${row.nameEn} — ${verified}${flag}`;
  });
  return [copy.subject, copy.intro, ...lines].join('\n');
}

export function bilingualStaleAlert(
  rows: readonly StaleProgramRow[],
  copy: { fr: StaleAlertCopy; en: StaleAlertCopy },
): { subject: string; text: string } {
  return {
    subject: `${copy.fr.subject} / ${copy.en.subject}`,
    text: [staleAlertBody(rows, copy.fr), '', staleAlertBody(rows, copy.en)].join('\n'),
  };
}
