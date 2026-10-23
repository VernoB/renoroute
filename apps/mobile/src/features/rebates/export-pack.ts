import {
  BRAND,
  buildSubsidyPack,
  type AppLocale,
  type SubsidyPackCopy,
  type SubsidyPackPlanLine,
  type VisibleRebateProgram,
} from '@renoroute/shared';

import { isPreviewLocked, type PlanView } from '@/features/plan/plan-view';

export type PackPrinter = {
  print: (html: string) => Promise<void>;
};

export function subsidyPackCopy(t: (key: string) => string): SubsidyPackCopy {
  return {
    title: t('rebates.packTitle'),
    disclaimer: t('review.disclaimer'),
    noFiling: t('rebates.noFiling'),
    forContractor: t('rebates.packForContractor'),
    forAdvisor: t('rebates.packForAdvisor'),
    emptyDossier: t('rebates.packEmptyDossier'),
    emptyPlan: t('rebates.packEmptyPlan'),
    kind: {
      document: t('rebates.kind.document'),
      invoice: t('rebates.kind.invoice'),
      model_number: t('rebates.kind.model_number'),
      deadline: t('rebates.kind.deadline'),
      reminder: t('rebates.kind.reminder'),
    },
  };
}

export function planLinesForPack(plan: PlanView | null): SubsidyPackPlanLine[] {
  if (!plan) {
    return [];
  }
  return plan.items
    .filter((item) => !isPreviewLocked(item.priority, plan.unlocked))
    .map((item) => ({ title: item.title, rationale: item.rationale }));
}

export async function exportSubsidyPackPdf({
  locale,
  printer,
  programs,
  plan,
  t,
}: {
  locale: AppLocale;
  printer: PackPrinter;
  programs: readonly VisibleRebateProgram[];
  plan: PlanView | null;
  t: (key: string) => string;
}): Promise<void> {
  const pack = buildSubsidyPack({
    appName: BRAND.name,
    copy: subsidyPackCopy(t),
    locale,
    planLines: planLinesForPack(plan),
    programs,
  });
  await printer.print(pack.html);
}
