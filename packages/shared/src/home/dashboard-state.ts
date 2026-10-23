import type { HomeInput } from './home-input.ts';

export const DASHBOARD_STATES = [
  'no_home',
  'intake_partial',
  'plan_preview',
  'plan_complete',
] as const;

export type DashboardState = (typeof DASHBOARD_STATES)[number];

export type PlanProgress = 'none' | 'preview' | 'unlocked' | 'archived';

/** S07 fields that make intake complete enough to generate a plan. */
export function isIntakeComplete(home: Partial<HomeInput> | null): boolean {
  if (!home) {
    return false;
  }
  return (
    home.homeType != null &&
    home.yearBuilt != null &&
    home.heatingPrimary != null &&
    home.heatingPrimary !== 'unknown' &&
    home.electricUtility != null
  );
}

export function dashboardState(input: {
  hasHome: boolean;
  home: Partial<HomeInput> | null;
  planProgress: PlanProgress;
}): DashboardState {
  if (!input.hasHome) {
    return 'no_home';
  }
  if (input.planProgress === 'unlocked') {
    return 'plan_complete';
  }
  if (input.planProgress === 'preview') {
    return 'plan_preview';
  }
  if (!isIntakeComplete(input.home)) {
    return 'intake_partial';
  }
  return 'intake_partial';
}

export function nextActionKey(
  state: DashboardState,
  extras: { intakeComplete?: boolean; photoCount?: number } = {},
): `dashboard.next.${DashboardState | 'photos' | 'review' | 'preview'}` {
  if (state === 'intake_partial' && extras.intakeComplete) {
    return (extras.photoCount ?? 0) > 0 ? 'dashboard.next.review' : 'dashboard.next.preview';
  }
  return `dashboard.next.${state}`;
}

export function intakePercent(home: Partial<HomeInput> | null): number {
  if (!home) {
    return 0;
  }
  const fields = [
    home.homeType,
    home.yearBuilt,
    home.floorAreaSqft,
    home.heatingPrimary && home.heatingPrimary !== 'unknown',
    home.waterHeater,
    home.annualElectricityKwh ?? home.annualEnergyCostCad,
    home.occupants,
    home.householdIncomeBand,
  ];
  const filled = fields.filter((value) => value != null && value !== false).length;
  return Math.round((filled / fields.length) * 100);
}
