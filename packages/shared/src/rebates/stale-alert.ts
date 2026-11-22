import { ADMIN_STALE_AFTER_DAYS, isVerificationStale } from './admin-catalog.ts';

export type StaleProgramRow = {
  id: string;
  nameFr: string;
  nameEn: string;
  lastVerifiedAt: string | null;
  isPublished: boolean;
  jurisdiction?: string | null;
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

/** One bilingual alert body per jurisdiction. Drafts with no date count as stale. */
export function staleAlertsByProvince(
  rows: readonly StaleProgramRow[],
  copy: { fr: StaleAlertCopy; en: StaleAlertCopy },
  now: Date = new Date(),
): { jurisdiction: string; subject: string; text: string }[] {
  const groups = new Map<string, StaleProgramRow[]>();
  for (const row of stalePrograms(rows, now)) {
    const jurisdiction = row.jurisdiction && row.jurisdiction.length > 0 ? row.jurisdiction : 'CA';
    const list = groups.get(jurisdiction) ?? [];
    list.push(row);
    groups.set(jurisdiction, list);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([jurisdiction, group]) => ({
      jurisdiction,
      ...bilingualStaleAlert(group, copy),
    }));
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
