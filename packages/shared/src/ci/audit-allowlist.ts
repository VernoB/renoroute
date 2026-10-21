export type AuditAdvisory = {
  github_advisory_id?: string;
  severity?: string;
  patched_versions?: string;
  module_name?: string;
};

export type AuditReport = {
  advisories?: Record<string, AuditAdvisory>;
};

/** High advisories with no upstream patch on 2026-10-20. Remove an entry when a fix exists. */
export const UNPATCHED_HIGH_ALLOWLIST = [
  {
    id: 'GHSA-86w9-cpqp-85rv',
    moduleName: 'node-forge',
    reason: 'patched_versions is <0.0.0. Transitive via the Expo CLI.',
  },
  {
    id: 'GHSA-vfj7-8cjw-p6xm',
    moduleName: 'braces',
    reason: 'patched_versions is <0.0.0. Transitive via Jest.',
  },
] as const;

const allowedIds = new Set<string>(UNPATCHED_HIGH_ALLOWLIST.map((entry) => entry.id));

/**
 * High and critical advisories fail CI.
 * An allowlisted advisory fails too once a patched version exists, or once it disappears.
 */
export function blockingAdvisories(report: AuditReport): string[] {
  const messages: string[] = [];
  const seen = new Set<string>();

  for (const advisory of Object.values(report.advisories ?? {})) {
    if (advisory.severity !== 'high' && advisory.severity !== 'critical') {
      continue;
    }
    const id = advisory.github_advisory_id ?? 'unknown';
    seen.add(id);
    if (!allowedIds.has(id)) {
      messages.push(
        `${advisory.severity} ${id} (${advisory.module_name ?? 'unknown'}) is not allowlisted`,
      );
      continue;
    }
    if (advisory.patched_versions !== '<0.0.0') {
      messages.push(
        `${id} now has a patched version (${advisory.patched_versions ?? 'unknown'}). Remove the allowlist entry and upgrade.`,
      );
    }
  }

  for (const entry of UNPATCHED_HIGH_ALLOWLIST) {
    if (!seen.has(entry.id)) {
      messages.push(
        `${entry.id} is allowlisted but no longer reported. Remove the allowlist entry.`,
      );
    }
  }

  return messages;
}
