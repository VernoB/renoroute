import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const REQUIRED_PUBLIC_TABLES = [
  'assessments',
  'homes',
  'home_photos',
  'payments',
  'plan_items',
  'plans',
  'profiles',
  'rebate_programs',
] as const;

export const DB_CONTAINER = 'supabase_db_RenoRoute';
export const RESTORE_DB = 'restore_check';

export const AUTH_STUB_SQL = `
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid NOT NULL PRIMARY KEY
);
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULL::uuid;
$$;
`;

export function tablesInDump(sql: string): string[] {
  const found: string[] = [];
  const pattern = /CREATE TABLE IF NOT EXISTS "public"\."([a-z_]+)"/g;
  for (const match of sql.matchAll(pattern)) {
    const name = match[1];
    if (name) {
      found.push(name);
    }
  }
  return found;
}

export function assertDumpHasRequiredTables(sql: string): string[] {
  const found = tablesInDump(sql);
  const missing = REQUIRED_PUBLIC_TABLES.filter((name) => !found.includes(name));
  if (missing.length > 0) {
    throw new Error(`dump is missing ${missing.join(', ')}`);
  }
  return found;
}

function supabaseJs(repoRoot: string): string {
  return path.join(repoRoot, 'node_modules', 'supabase', 'dist', 'supabase.js');
}

function run(command: string, args: string[], cwd?: string): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) {
    const detail = result.stderr || result.stdout || result.error?.message || 'no output';
    throw new Error(`${command} ${args.join(' ')} failed: ${detail}`);
  }
  return result.stdout;
}

export function dumpAndRestore(repoRoot: string): { tables: string[]; restoredHomes: number } {
  const dir = mkdtempSync(path.join(tmpdir(), 'renoroute-backup-'));
  const dumpFile = path.join(dir, 'public.dump.sql');
  try {
    run(
      process.execPath,
      [supabaseJs(repoRoot), 'db', 'dump', '--local', '--schema', 'public', '-f', dumpFile],
      repoRoot,
    );
    const sql = readFileSync(dumpFile, 'utf8');
    const tables = assertDumpHasRequiredTables(sql);
    run('docker', [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-c',
      `DROP DATABASE IF EXISTS ${RESTORE_DB};`,
    ]);
    run('docker', [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-c',
      `CREATE DATABASE ${RESTORE_DB};`,
    ]);
    run('docker', [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      RESTORE_DB,
      '-c',
      AUTH_STUB_SQL,
    ]);
    run('docker', ['cp', dumpFile, `${DB_CONTAINER}:/tmp/public.dump.sql`]);
    run('docker', [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      RESTORE_DB,
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      '/tmp/public.dump.sql',
    ]);
    const countOut = run('docker', [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      RESTORE_DB,
      '-tAc',
      'select count(*) from public.homes;',
    ]);
    const restoredHomes = Number.parseInt(countOut.trim(), 10);
    if (Number.isNaN(restoredHomes)) {
      throw new Error(`restore count was not a number: ${countOut}`);
    }
    return { tables, restoredHomes };
  } finally {
    try {
      run('docker', [
        'exec',
        DB_CONTAINER,
        'psql',
        '-U',
        'postgres',
        '-c',
        `DROP DATABASE IF EXISTS ${RESTORE_DB};`,
      ]);
    } catch {
      // Best-effort cleanup of the throwaway restore database.
    }
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv.includes('--run')) {
  const result = dumpAndRestore(process.cwd());
  process.stdout.write(
    `backup-restore-check: ${result.tables.length} public tables, homes=${result.restoredHomes}\n`,
  );
}
