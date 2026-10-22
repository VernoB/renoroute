import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

import { BRAND } from '../packages/shared/src/config/brand.ts';
import { maestroPlan } from '../packages/shared/src/ci/maestro-plan.ts';

const flow = 'apps/mobile/.maestro/app-launches.yaml';

function commandExists(name: string): boolean {
  const checker = process.platform === 'win32' ? 'where.exe' : 'which';
  const result = spawnSync(checker, [name], { encoding: 'utf8' });
  return result.status === 0;
}

function deviceOnline(): boolean {
  const result = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  return (result.stdout ?? '')
    .split(/\r?\n/)
    .some((line) => line.trim().endsWith('device') && !line.startsWith('List of devices'));
}

const plan = maestroPlan({
  flowExists: existsSync(flow),
  maestroInstalled: commandExists('maestro'),
  adbInstalled: commandExists('adb'),
  deviceOnline: commandExists('adb') && deviceOnline(),
});

if (plan === 'missing-flow') {
  process.stderr.write(`Missing Maestro flow: ${flow}\n`);
  process.exit(1);
}

if (plan === 'skip') {
  process.stdout.write(
    'Maestro device flow not run: install the Maestro CLI and start the Android emulator.\n',
  );
  process.exit(0);
}

const run = spawnSync('maestro', ['test', '-e', `APP_ID=${BRAND.iosBundleId}`, flow], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(run.status ?? 1);
