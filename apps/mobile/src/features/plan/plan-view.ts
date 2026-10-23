import { formatCad, type AppLocale } from '@renoroute/shared/i18n';

const PREVIEW_ITEM_LIMIT = 2;

export type PlanMeasureCard = {
  id: string;
  priority: number;
  title: string;
  rationale: string;
  costLowCad: number | null;
  costHighCad: number | null;
  savingsLowCad: number | null;
  savingsHighCad: number | null;
  confidence: 'low' | 'medium' | 'high' | null;
};

export type PlanView = {
  id: string;
  unlocked: boolean;
  totalCostLowCad: number | null;
  totalCostHighCad: number | null;
  annualSavingsLowCad: number | null;
  annualSavingsHighCad: number | null;
  rebateLowCad: number | null;
  rebateHighCad: number | null;
  items: PlanMeasureCard[];
};

export function isPreviewLocked(priority: number, unlocked: boolean): boolean {
  return !unlocked && priority > PREVIEW_ITEM_LIMIT;
}

export function formatCadRange(
  low: number | null,
  high: number | null,
  locale: AppLocale,
): string | null {
  if (low === null && high === null) {
    return null;
  }
  const safeLow = low ?? high ?? 0;
  const safeHigh = high ?? low ?? 0;
  if (safeLow === safeHigh) {
    return formatCad(safeLow, locale);
  }
  return `${formatCad(safeLow, locale)} – ${formatCad(safeHigh, locale)}`;
}
