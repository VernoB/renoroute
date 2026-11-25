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

function connectedDevices(): { serial: string; state: string }[] {
  const result = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    return [];
  }
  return (result.stdout ?? '')
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [serial, state] = line.split(/\s+/);
      return { serial: serial ?? '', state: state ?? '' };
    })
    .filter((device) => device.serial.length > 0);
}

/** `adb devices` can list an emulator before Android has finished booting. */
function isBooted(serial: string): boolean {
  const result = spawnSync('adb', ['-s', serial, 'shell', 'getprop', 'sys.boot_completed'], {
    encoding: 'utf8',
    timeout: 10_000,
  });
  return result.status === 0 && (result.stdout ?? '').replace(/\r/g, '').trim() === '1';
}

const devices = commandExists('adb') ? connectedDevices() : [];
const online = devices.filter((device) => device.state === 'device');
const ready = online.filter((device) => isBooted(device.serial));

const plan = maestroPlan({
  flowExists: existsSync(flow),
  maestroInstalled: commandExists('maestro'),
  adbInstalled: commandExists('adb'),
  deviceOnline: ready.length > 0,
});

if (plan === 'missing-flow') {
  process.stderr.write(`Missing Maestro flow: ${flow}\n`);
  process.exit(1);
}

if (plan === 'skip') {
  if (online.length > 0) {
    const names = online.map((device) => device.serial).join(', ');
    process.stdout.write(
      `Maestro skipped: ${names} is connected but not booted and ready (sys.boot_completed is not 1). The Android driver is not started. Wait until the emulator finishes booting, then retry.\n`,
    );
  } else {
    process.stdout.write(
      'Maestro device flow not run: install the Maestro CLI and start the Android emulator.\n',
    );
  }
  process.exit(0);
}

const run = spawnSync('maestro', ['test', '-e', `APP_ID=${BRAND.iosBundleId}`, flow], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
if (run.error) {
  process.stderr.write(`Maestro failed to start: ${run.error.message}\n`);
  process.exit(1);
}
if ((run.status ?? 1) !== 0) {
  const serials = ready.map((device) => device.serial).join(', ');
  if (/driver/i.test(output) && /timed out|timeout|did not start/i.test(output)) {
    process.stderr.write(
      `Maestro failed: the Android driver did not start in time on ${serials}. Boot the emulator fully, then retry.\n`,
    );
  } else {
    process.stderr.write(`Maestro failed (exit ${run.status ?? 1}) on ${serials}.\n`);
    process.stderr.write(output);
  }
  process.exit(run.status ?? 1);
}
process.stdout.write(output);
process.exit(0);
