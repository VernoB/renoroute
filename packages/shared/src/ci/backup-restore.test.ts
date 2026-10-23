import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const REQUIRED = [
  'assessments',
  'homes',
  'home_photos',
  'payments',
  'plan_items',
  'plans',
  'profiles',
  'rebate_programs',
] as const;

function tablesInDump(sql: string): string[] {
  return [...sql.matchAll(/CREATE TABLE IF NOT EXISTS "public"\."([a-z_]+)"/g)].flatMap((match) =>
    match[1] ? [match[1]] : [],
  );
}

test('the backup script dumps local public schema and restores into a throwaway database', () => {
  const source = readFileSync(path.join(repoRoot, 'scripts/backup-restore-check.ts'), 'utf8');
  assert.match(source, /'dump'/);
  assert.match(source, /'--local'/);
  assert.match(source, /'--schema'/);
  assert.match(source, /restore_check/);
  assert.match(source, /auth\.users/);
  assert.match(source, /DROP DATABASE IF EXISTS/);
  for (const name of REQUIRED) {
    assert.match(source, new RegExp(`'${name}'`));
  }
});

test('a quoted pg_dump listing is accepted only when required tables exist', () => {
  const sql = REQUIRED.map(
    (name) => `CREATE TABLE IF NOT EXISTS "public"."${name}" (id uuid);`,
  ).join('\n');
  assert.deepEqual(tablesInDump(sql).sort(), [...REQUIRED].sort());
  assert.equal(
    tablesInDump('CREATE TABLE IF NOT EXISTS "public"."waitlist" (id uuid);').includes('homes'),
    false,
  );
});
