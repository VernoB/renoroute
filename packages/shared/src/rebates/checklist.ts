import { evaluationWindowEnd } from '../calc/evaluation-window.ts';
import type { ProgramStatus } from '../home/enums.ts';

/** Official advisor directory is not confirmed. Do not invent a government URL. */
export const ADVISOR_DIRECTORY_URL = 'https://TODO-verify-official-url';

export const HOMEOWNER_PROGRAM_STATUSES = [
  'open',
  'waitlist',
  'full',
  'upcoming',
  'paused',
] as const;

export type HomeownerProgramStatus = (typeof HOMEOWNER_PROGRAM_STATUSES)[number];

export type RebateProgramSource = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  administrator: string;
  status: ProgramStatus;
  requiresPreEvaluation: boolean;
  completionWindowMonths: number | null;
  officialUrl: string | null;
  sourceUrl: string;
  lastVerifiedAt: string;
  isPublished: boolean;
  rules: readonly RebateRuleAmount[];
  dossierItems: readonly RebateDossierItem[];
};

export type RebateRuleAmount = {
  id: string;
  measure: string;
  amountMinCad: number | null;
  amountMaxCad: number | null;
};

export type RebateDossierItem = {
  id: string;
  kind: string;
  labelFr: string;
  labelEn: string;
  sourceUrl: string | null;
  isPublished: boolean;
};

export type VisibleRebateProgram = Omit<RebateProgramSource, 'status' | 'dossierItems'> & {
  status: HomeownerProgramStatus;
  deadline: string | null;
  officialUrl: string;
  dossierItems: readonly RebateDossierItem[];
};

export function homeownerStatus(status: ProgramStatus): HomeownerProgramStatus | null {
  if (status === 'closed') {
    return null;
  }
  if (status === 'announced') {
    return 'upcoming';
  }
  return status;
}

export function officialHttpsUrl(value: string | null | undefined): string {
  return typeof value === 'string' && value.startsWith('https://') ? value : ADVISOR_DIRECTORY_URL;
}

export function publishedDossierItems(items: readonly RebateDossierItem[]): RebateDossierItem[] {
  return items.filter(
    (item) =>
      item.isPublished &&
      typeof item.sourceUrl === 'string' &&
      item.sourceUrl.startsWith('https://'),
  );
}

export function visibleRebatePrograms(
  programs: readonly RebateProgramSource[],
  preEvaluationDate: string | null,
): VisibleRebateProgram[] {
  return programs.flatMap((program) => {
    if (!program.isPublished) {
      return [];
    }
    const status = homeownerStatus(program.status);
    if (!status) {
      return [];
    }
    const windowMonths = program.completionWindowMonths;
    return [
      {
        ...program,
        status,
        officialUrl: officialHttpsUrl(program.officialUrl),
        deadline:
          windowMonths === null ? null : evaluationWindowEnd(preEvaluationDate, windowMonths),
        dossierItems: publishedDossierItems(program.dossierItems),
      },
    ];
  });
}

export function needsAdvisorStep(programs: readonly VisibleRebateProgram[]): boolean {
  return programs.some((program) => program.requiresPreEvaluation);
}
