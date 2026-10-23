import {
  ELECTRIC_UTILITIES,
  ENERGY_ADVISOR_STATUSES,
  HEATING_SYSTEMS,
  INCOME_BANDS,
  PROGRAM_STATUSES,
  type ElectricUtility,
  type EnergyAdvisorStatus,
  type HeatingSystem,
  type IncomeBand,
  type ProgramStatus,
} from '../home/enums.ts';
import { parseRebateConditions, type RebateConditions } from '../rebates/conditions.ts';

export const ELIGIBILITY_STATUSES = ['likely', 'possible', 'not_eligible', 'unknown'] as const;

export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

export const ELIGIBILITY_REASONS = [
  'program_closed',
  'program_paused',
  'program_announced',
  'program_waitlist',
  'rule_inactive',
  'invalid_conditions',
  'utility_mismatch',
  'utility_unknown',
  'income_over_max',
  'income_unknown',
  'heating_not_eligible',
  'heating_unknown',
  'owner_occupied_required',
  'owner_occupied_unknown',
  'pre_evaluation_required',
] as const;

export type EligibilityReason = (typeof ELIGIBILITY_REASONS)[number];

export type EligibilityHome = {
  electricUtility: ElectricUtility | null;
  householdIncomeBand: IncomeBand | null;
  heatingPrimary: HeatingSystem | null;
  ownerOccupied: boolean | null;
  energyAdvisorStatus?: EnergyAdvisorStatus | null;
};

export type EligibilityProgram = {
  slug: string;
  status: ProgramStatus;
  requiresPreEvaluation: boolean;
  incomeMaxCad: number | null;
  appliesToUtilities: readonly ElectricUtility[] | null;
};

export type EligibilityRule = {
  measure: string;
  conditions: unknown;
  isActive: boolean;
};

export type EligibilityResult = {
  status: EligibilityStatus;
  reasons: EligibilityReason[];
};

/** Upper bound implied by the income-band enum label, not a government table. */
const INCOME_BAND_CEILING_CAD: Record<IncomeBand, number | null> = {
  under_70k: 70_000,
  from_70k_to_100k: 100_000,
  from_100k_to_150k: 150_000,
  over_150k: Number.POSITIVE_INFINITY,
  prefer_not_to_say: null,
};

const PRE_EVAL_DONE: readonly EnergyAdvisorStatus[] = [
  'pre_evaluation_done',
  'post_evaluation_done',
];

function isUtility(value: string | null): value is ElectricUtility {
  return value !== null && (ELECTRIC_UTILITIES as readonly string[]).includes(value);
}

function isHeating(value: string | null): value is HeatingSystem {
  return value !== null && (HEATING_SYSTEMS as readonly string[]).includes(value);
}

function isIncomeBand(value: string | null): value is IncomeBand {
  return value !== null && (INCOME_BANDS as readonly string[]).includes(value);
}

function isProgramStatus(value: string): value is ProgramStatus {
  return (PROGRAM_STATUSES as readonly string[]).includes(value);
}

function isAdvisorStatus(value: string | null | undefined): value is EnergyAdvisorStatus {
  return (
    value !== null &&
    value !== undefined &&
    (ENERGY_ADVISOR_STATUSES as readonly string[]).includes(value)
  );
}

function addReason(reasons: EligibilityReason[], reason: EligibilityReason): void {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function applyProgramStatus(
  status: ProgramStatus,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  if (status === 'closed') {
    addReason(reasons, 'program_closed');
    return 'not_eligible';
  }
  if (status === 'paused') {
    addReason(reasons, 'program_paused');
    return 'not_eligible';
  }
  if (status === 'announced') {
    addReason(reasons, 'program_announced');
    return 'possible';
  }
  if (status === 'waitlist' || status === 'full') {
    addReason(reasons, 'program_waitlist');
    return 'possible';
  }
  return null;
}

function applyUtilities(
  home: EligibilityHome,
  allowed: readonly ElectricUtility[] | undefined,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  if (!allowed || allowed.length === 0) {
    return null;
  }
  if (!isUtility(home.electricUtility) || home.electricUtility === 'unknown') {
    addReason(reasons, 'utility_unknown');
    return 'unknown';
  }
  if (!allowed.includes(home.electricUtility)) {
    addReason(reasons, 'utility_mismatch');
    return 'not_eligible';
  }
  return null;
}

function applyIncome(
  home: EligibilityHome,
  maxCad: number | undefined,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  if (maxCad === undefined) {
    return null;
  }
  if (!isIncomeBand(home.householdIncomeBand) || home.householdIncomeBand === 'prefer_not_to_say') {
    addReason(reasons, 'income_unknown');
    return 'unknown';
  }
  const ceiling = INCOME_BAND_CEILING_CAD[home.householdIncomeBand];
  if (ceiling === null || ceiling > maxCad) {
    addReason(reasons, 'income_over_max');
    return 'not_eligible';
  }
  return null;
}

function applyHeating(
  home: EligibilityHome,
  allowed: readonly HeatingSystem[] | undefined,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  if (!allowed || allowed.length === 0) {
    return null;
  }
  if (!isHeating(home.heatingPrimary) || home.heatingPrimary === 'unknown') {
    addReason(reasons, 'heating_unknown');
    return 'unknown';
  }
  if (!allowed.includes(home.heatingPrimary)) {
    addReason(reasons, 'heating_not_eligible');
    return 'not_eligible';
  }
  return null;
}

function applyOwnerOccupied(
  home: EligibilityHome,
  required: boolean | undefined,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  if (!required) {
    return null;
  }
  if (home.ownerOccupied === null) {
    addReason(reasons, 'owner_occupied_unknown');
    return 'unknown';
  }
  if (home.ownerOccupied === false) {
    addReason(reasons, 'owner_occupied_required');
    return 'not_eligible';
  }
  return null;
}

function applyPreEvaluation(
  home: EligibilityHome,
  conditions: RebateConditions,
  program: EligibilityProgram,
  reasons: EligibilityReason[],
): EligibilityStatus | null {
  const required =
    program.requiresPreEvaluation || conditions.requires_program_pre_evaluation === true;
  if (!required) {
    return null;
  }
  if (
    isAdvisorStatus(home.energyAdvisorStatus) &&
    PRE_EVAL_DONE.includes(home.energyAdvisorStatus)
  ) {
    return null;
  }
  addReason(reasons, 'pre_evaluation_required');
  return 'possible';
}

function worstStatus(
  current: EligibilityStatus,
  next: EligibilityStatus | null,
): EligibilityStatus {
  if (next === null) {
    return current;
  }
  const rank: Record<EligibilityStatus, number> = {
    likely: 0,
    possible: 1,
    unknown: 2,
    not_eligible: 3,
  };
  return rank[next] > rank[current] ? next : current;
}

export function evaluateEligibility(
  home: EligibilityHome,
  program: EligibilityProgram,
  rule: EligibilityRule,
): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  if (!rule.isActive) {
    return { status: 'not_eligible', reasons: ['rule_inactive'] };
  }
  if (!isProgramStatus(program.status)) {
    return { status: 'unknown', reasons: ['invalid_conditions'] };
  }

  const parsed = parseRebateConditions(rule.conditions);
  if (!parsed.ok) {
    return { status: 'unknown', reasons: ['invalid_conditions'] };
  }

  let status: EligibilityStatus = 'likely';
  status = worstStatus(status, applyProgramStatus(program.status, reasons));
  if (status === 'not_eligible') {
    return { status, reasons };
  }

  const utilities = parsed.value.utilities ?? program.appliesToUtilities ?? undefined;
  status = worstStatus(status, applyUtilities(home, utilities, reasons));
  status = worstStatus(
    status,
    applyIncome(
      home,
      parsed.value.max_household_income_cad ?? program.incomeMaxCad ?? undefined,
      reasons,
    ),
  );
  status = worstStatus(status, applyHeating(home, parsed.value.eligible_heating_before, reasons));
  status = worstStatus(status, applyOwnerOccupied(home, parsed.value.owner_occupied_only, reasons));
  if (status !== 'not_eligible') {
    status = worstStatus(status, applyPreEvaluation(home, parsed.value, program, reasons));
  }

  return { status, reasons };
}
