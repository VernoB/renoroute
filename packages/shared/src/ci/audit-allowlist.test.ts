import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  blockingAdvisories,
  UNPATCHED_HIGH_ALLOWLIST,
  type AuditReport,
} from './audit-allowlist.ts';

function report(advisories: AuditReport['advisories']): AuditReport {
  return { advisories };
}

const knownUnpatched = Object.fromEntries(
  UNPATCHED_HIGH_ALLOWLIST.map((entry) => [
    entry.id,
    {
      github_advisory_id: entry.id,
      severity: 'high',
      patched_versions: '<0.0.0',
      module_name: entry.moduleName,
    },
  ]),
);

describe('blockingAdvisories', () => {
  it('accepts the known unpatched highs and ignores moderate findings', () => {
    assert.deepEqual(
      blockingAdvisories(
        report({
          ...knownUnpatched,
          moderate: {
            github_advisory_id: 'GHSA-moderate',
            severity: 'moderate',
            module_name: 'example',
          },
        }),
      ),
      [],
    );
  });

  it('rejects a new high or critical advisory', () => {
    const messages = blockingAdvisories(
      report({
        ...knownUnpatched,
        new: { github_advisory_id: 'GHSA-new', severity: 'critical', module_name: 'left-pad' },
      }),
    );
    assert.equal(messages.length, 1);
    assert.match(messages[0] ?? '', /GHSA-new/);
  });

  it('rejects an allowlisted advisory once a patch exists', () => {
    const messages = blockingAdvisories(
      report({
        ...knownUnpatched,
        'GHSA-86w9-cpqp-85rv': {
          github_advisory_id: 'GHSA-86w9-cpqp-85rv',
          severity: 'high',
          patched_versions: '>=1.4.1',
          module_name: 'node-forge',
        },
      }),
    );
    assert.match(messages.join('\n'), /GHSA-86w9-cpqp-85rv/);
  });

  it('rejects a stale allowlist entry', () => {
    const rest = Object.fromEntries(
      Object.entries(knownUnpatched).filter(([id]) => id !== 'GHSA-vfj7-8cjw-p6xm'),
    );
    const messages = blockingAdvisories(report(rest));
    assert.match(messages.join('\n'), /GHSA-vfj7-8cjw-p6xm/);
  });
});
