import { spawnSync } from 'node:child_process';

import { blockingAdvisories, type AuditReport } from './audit-allowlist.ts';

const command = process.platform === 'win32' ? 'corepack.cmd' : 'corepack';
const result = spawnSync(command, ['pnpm', 'audit', '--json'], {
  encoding: 'utf8',
  cwd: process.cwd(),
  shell: process.platform === 'win32',
});

const stdout = result.stdout ?? '';
if (stdout.trim().length === 0) {
  process.stderr.write(result.stderr ?? result.error?.message ?? 'pnpm audit produced no output\n');
  process.exit(result.status ?? 1);
}

const report = JSON.parse(stdout) as AuditReport;
const messages = blockingAdvisories(report);

if (messages.length > 0) {
  process.stderr.write(`${messages.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('No new high or critical advisories.\n');
