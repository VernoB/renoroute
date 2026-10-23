import type { AppLocale } from '../i18n/locale.ts';
import { publishedDossierItems, type VisibleRebateProgram } from './checklist.ts';

export const CHECKLIST_KINDS = [
  'document',
  'invoice',
  'model_number',
  'deadline',
  'reminder',
] as const;

export type ChecklistKind = (typeof CHECKLIST_KINDS)[number];

export type SubsidyPackCopy = {
  title: string;
  disclaimer: string;
  noFiling: string;
  forContractor: string;
  forAdvisor: string;
  emptyDossier: string;
  emptyPlan: string;
  kind: Record<ChecklistKind, string>;
};

export type SubsidyPackPlanLine = {
  title: string;
  rationale: string;
};

export type SubsidyPack = {
  html: string;
  text: string;
  dossierLines: readonly string[];
};

export function buildSubsidyPack({
  appName,
  copy,
  locale,
  programs,
  planLines,
}: {
  appName: string;
  copy: SubsidyPackCopy;
  locale: AppLocale;
  programs: readonly VisibleRebateProgram[];
  planLines: readonly SubsidyPackPlanLine[];
}): SubsidyPack {
  const dossierLines = programs.flatMap((program) =>
    publishedDossierItems(program.dossierItems).map((item) =>
      locale === 'en' ? item.labelEn : item.labelFr,
    ),
  );
  const programBlocks = programs.map((program) => {
    const name = locale === 'en' ? program.nameEn : program.nameFr;
    const items = publishedDossierItems(program.dossierItems);
    const itemLines =
      items.length === 0
        ? [copy.emptyDossier]
        : items.map((item) => {
            const label = locale === 'en' ? item.labelEn : item.labelFr;
            return `${kindLabel(item.kind, copy)}: ${label}`;
          });
    return { name, itemLines, items };
  });
  const planText =
    planLines.length === 0
      ? [copy.emptyPlan]
      : planLines.map((line) => `${line.title}: ${line.rationale}`);
  const text = [
    copy.title,
    copy.disclaimer,
    copy.noFiling,
    copy.forContractor,
    copy.forAdvisor,
    ...programBlocks.flatMap((block) => [block.name, ...block.itemLines]),
    ...planText,
  ].join('\n');
  const programHtml = programBlocks
    .map((block) => {
      const list =
        block.items.length === 0
          ? `<p>${escapeHtml(copy.emptyDossier)}</p>`
          : `<ul>${block.items
              .map((item) => {
                const label = locale === 'en' ? item.labelEn : item.labelFr;
                return `<li>${escapeHtml(kindLabel(item.kind, copy))}: ${escapeHtml(label)} — ${escapeHtml(item.sourceUrl ?? '')}</li>`;
              })
              .join('')}</ul>`;
      return `<section><h2>${escapeHtml(block.name)}</h2>${list}</section>`;
    })
    .join('');
  const planHtml =
    planLines.length === 0
      ? `<p>${escapeHtml(copy.emptyPlan)}</p>`
      : `<ul>${planLines
          .map((line) => `<li>${escapeHtml(line.title)}: ${escapeHtml(line.rationale)}</li>`)
          .join('')}</ul>`;
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"/><title>${escapeHtml(copy.title)}</title></head><body><h1>${escapeHtml(appName)} — ${escapeHtml(copy.title)}</h1><p><strong>${escapeHtml(copy.disclaimer)}</strong></p><p>${escapeHtml(copy.noFiling)}</p><p>${escapeHtml(copy.forContractor)} · ${escapeHtml(copy.forAdvisor)}</p>${programHtml}<section><h2>${escapeHtml(copy.forContractor)}</h2>${planHtml}</section></body></html>`;
  return { html, text, dossierLines };
}

function kindLabel(kind: string, copy: SubsidyPackCopy): string {
  return kind in copy.kind ? copy.kind[kind as ChecklistKind] : kind;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
