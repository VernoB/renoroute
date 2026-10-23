import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import {
  exifDevicePlan,
  exifToolSawGps,
  type ExifToolGpsTags,
} from '../packages/shared/src/photos/exif-tool-check.ts';
import { prepareUploadJpeg } from '../packages/shared/src/photos/jpeg-exif.ts';
import { PHOTO_MAX_BYTES } from '../packages/shared/src/photos/photo-upload.ts';

const ANDROID_DIR = '/data/local/tmp/renoroute-exif';
const EXIFTOOL_VERSION = '13.59';
const EXIFTOOL_WINDOWS_64_SHA256 =
  '44b512b25af500724ba579d0a53c8fc5851628b692dd5e5d94ae4a15c2cba9ec';
const SEED_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAAEAAQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGCAcJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/2gAMAwEAAhEDEQH/APf6KKKACiiigD//2Q==',
  'base64',
);

const adbBin = resolveAdb();
const androidSerial = adbBin ? firstAdbDevice(adbBin) : null;
const iosOnline = iosSimulatorBooted();
const plan = exifDevicePlan({
  androidOnline: androidSerial !== null,
  iosOnline,
});

if (plan === 'skip') {
  process.stdout.write(
    'ExifTool device check not run: start the Android emulator (adb) or an iOS Simulator.\n',
  );
  process.exit(0);
}

const exifToolBin = await resolveExifTool();
const work = mkdtempSync(join(tmpdir(), 'renoroute-exif-'));
const dirtyHost = join(work, 'dirty-gps.jpg');
writeFileSync(dirtyHost, SEED_JPEG);

writeGps(dirtyHost);
assertGps(dirtyHost, true, 'host JPEG after ExifTool GPS write');

if (plan === 'android' || plan === 'both') {
  await checkAndroid(dirtyHost);
}
if (plan === 'ios' || plan === 'both') {
  await checkIos(dirtyHost);
}
process.stdout.write(`ExifTool device check passed (${plan}).\n`);

async function checkAndroid(dirty: string): Promise<void> {
  if (!adbBin || !androidSerial) {
    throw new Error('Android emulator went offline');
  }
  const dirtyDevice = `${ANDROID_DIR}/dirty-gps.jpg`;
  const strippedDevice = `${ANDROID_DIR}/stripped.jpg`;
  const pulledDirty = join(work, 'from-android-dirty.jpg');
  const strippedHost = join(work, 'android-stripped.jpg');
  const pulledStripped = join(work, 'from-android-stripped.jpg');

  adb(['shell', 'mkdir', '-p', ANDROID_DIR]);
  adb(['push', dirty, dirtyDevice]);
  adb(['pull', dirtyDevice, pulledDirty]);
  assertGps(pulledDirty, true, 'Android emulator before strip');

  await stripAndWrite(pulledDirty, strippedHost);
  assertGps(strippedHost, false, 'stripped JPEG before Android push');

  adb(['push', strippedHost, strippedDevice]);
  adb(['pull', strippedDevice, pulledStripped]);
  assertGps(pulledStripped, false, 'Android emulator after strip');
}

async function checkIos(dirty: string): Promise<void> {
  const pulledDirty = join(work, 'from-ios-dirty.jpg');
  const strippedHost = join(work, 'ios-stripped.jpg');
  const pulledStripped = join(work, 'from-ios-stripped.jpg');
  copyThroughIosSimulator(dirty, pulledDirty);
  assertGps(pulledDirty, true, 'iOS Simulator before strip');
  await stripAndWrite(pulledDirty, strippedHost);
  assertGps(strippedHost, false, 'stripped JPEG before iOS copy');
  copyThroughIosSimulator(strippedHost, pulledStripped);
  assertGps(pulledStripped, false, 'iOS Simulator after strip');
}

async function stripAndWrite(source: string, dest: string): Promise<void> {
  const bytes = new Uint8Array(await readFile(source));
  const prepared = prepareUploadJpeg(bytes, PHOTO_MAX_BYTES);
  if (!prepared.ok) {
    throw new Error(`prepareUploadJpeg failed: ${prepared.reason}`);
  }
  writeFileSync(dest, Buffer.from(prepared.bytes));
}

function writeGps(path: string): void {
  runExifTool([
    '-overwrite_original',
    '-GPSLatitude=45.273',
    '-GPSLongitude=-66.063',
    '-GPSLatitudeRef=N',
    '-GPSLongitudeRef=W',
    path,
  ]);
}

function assertGps(path: string, expected: boolean, label: string): void {
  const tags = readGpsTags(path);
  const saw = exifToolSawGps(tags);
  process.stdout.write(
    `ExifTool ${label}: GPS=${saw} latitude=${String(tags.GPSLatitude)} longitude=${String(tags.GPSLongitude)}\n`,
  );
  if (saw !== expected) {
    throw new Error(`ExifTool ${label}: expected GPS=${expected}`);
  }
}

function readGpsTags(path: string): ExifToolGpsTags {
  const raw = runExifTool([
    '-json',
    '-n',
    '-GPSLatitude',
    '-GPSLongitude',
    '-GPSPosition',
    '-GPSLatitudeRef',
    '-GPSLongitudeRef',
    path,
  ]);
  const parsed = JSON.parse(raw) as ExifToolGpsTags[];
  return parsed[0] ?? {};
}

function runExifTool(args: string[]): string {
  const result = spawnSync(exifToolBin, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`exiftool ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout ?? '';
}

async function resolveExifTool(): Promise<string> {
  if (commandExists('exiftool')) {
    return 'exiftool';
  }
  if (process.platform === 'win32' && commandExists('exiftool.exe')) {
    return 'exiftool.exe';
  }
  const cached = findExifToolExe(
    join(process.env.LOCALAPPDATA ?? tmpdir(), 'renoroute-dev', `exiftool-${EXIFTOOL_VERSION}`),
  );
  if (cached) {
    return cached;
  }
  if (process.platform !== 'win32') {
    throw new Error('Install ExifTool (brew install exiftool) to run the device GPS check.');
  }
  return downloadWindowsExifTool();
}

async function downloadWindowsExifTool(): Promise<string> {
  const arch = process.arch === 'ia32' ? '32' : '64';
  const zipName = `exiftool-${EXIFTOOL_VERSION}_${arch}.zip`;
  const cache = join(process.env.LOCALAPPDATA ?? tmpdir(), 'renoroute-dev', `exiftool-${EXIFTOOL_VERSION}`);
  mkdirSync(cache, { recursive: true });
  const zipPath = join(cache, zipName);
  const urls = [
    `https://downloads.sourceforge.net/project/exiftool/${zipName}`,
    `https://sourceforge.net/projects/exiftool/files/${zipName}/download`,
    `https://exiftool.org/${zipName}`,
  ];
  let bytes: Buffer | null = null;
  for (const url of urls) {
    process.stdout.write(`Downloading Phil Harvey ExifTool ${EXIFTOOL_VERSION} from ${url}\n`);
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      process.stdout.write(`  skipped (${response.status})\n`);
      continue;
    }
    const downloaded = Buffer.from(await response.arrayBuffer());
    if (downloaded.subarray(0, 2).toString() !== 'PK') {
      process.stdout.write('  skipped (not a zip)\n');
      continue;
    }
    bytes = downloaded;
    break;
  }
  if (!bytes) {
    throw new Error(`download ExifTool failed from ${urls.join(', ')}`);
  }
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (arch === '64' && digest !== EXIFTOOL_WINDOWS_64_SHA256) {
    throw new Error(`ExifTool zip hash mismatch: ${digest}`);
  }
  writeFileSync(zipPath, bytes);
  const unpacked = spawnSync('tar', ['-xf', zipPath, '-C', cache], { encoding: 'utf8' });
  if (unpacked.status !== 0) {
    throw new Error(`unpack ExifTool failed: ${unpacked.stderr || unpacked.stdout}`);
  }
  const exe = findExifToolExe(cache);
  if (!exe) {
    throw new Error('ExifTool exe missing after unpack');
  }
  return exe;
}

function findExifToolExe(root: string): string | null {
  if (!existsSync(root)) {
    return null;
  }
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) {
      break;
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(path);
        continue;
      }
      if (entry.name === 'exiftool.exe' || entry.name === 'exiftool(-k).exe') {
        return path;
      }
    }
  }
  return null;
}

function adb(args: string[]): void {
  if (!adbBin || !androidSerial) {
    throw new Error('adb is not available');
  }
  const result = spawnSync(adbBin, ['-s', androidSerial, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`adb ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
}

function resolveAdb(): string | null {
  if (commandExists('adb')) {
    return 'adb';
  }
  const exe = process.platform === 'win32' ? 'adb.exe' : 'adb';
  const homes = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT];
  if (process.env.LOCALAPPDATA) {
    homes.push(join(process.env.LOCALAPPDATA, 'Android', 'Sdk'));
  }
  for (const home of homes) {
    if (!home) {
      continue;
    }
    const candidate = join(home, 'platform-tools', exe);
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function firstAdbDevice(bin: string): string | null {
  const result = spawnSync(bin, ['devices'], { encoding: 'utf8' });
  const line = (result.stdout ?? '')
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find((row) => /\tdevice$/.test(row));
  if (!line) {
    return null;
  }
  const serial = line.split(/\s+/)[0];
  return serial && serial !== 'List' ? serial : null;
}

function iosSimulatorBooted(): boolean {
  if (process.platform === 'win32' || !commandExists('xcrun')) {
    return false;
  }
  const result = spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted'], { encoding: 'utf8' });
  return result.status === 0 && /Booted/.test(result.stdout ?? '');
}

function copyThroughIosSimulator(from: string, to: string): void {
  const list = spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'], {
    encoding: 'utf8',
  });
  if (list.status !== 0) {
    throw new Error(`simctl list failed: ${list.stderr || list.stdout}`);
  }
  const parsed = JSON.parse(list.stdout) as {
    devices?: Record<string, Array<{ udid: string; state: string }>>;
  };
  const booted = Object.values(parsed.devices ?? {})
    .flat()
    .find((device) => device.state === 'Booted');
  if (!booted) {
    throw new Error('no booted iOS Simulator');
  }
  const dir = join(
    homedir(),
    'Library/Developer/CoreSimulator/Devices',
    booted.udid,
    'data',
    'tmp',
    'renoroute-exif',
  );
  mkdirSync(dir, { recursive: true });
  const simPath = join(dir, basename(from));
  copyFileSync(from, simPath);
  copyFileSync(simPath, to);
}

function commandExists(name: string): boolean {
  const checker = process.platform === 'win32' ? 'where.exe' : 'which';
  return spawnSync(checker, [name], { encoding: 'utf8' }).status === 0;
}
