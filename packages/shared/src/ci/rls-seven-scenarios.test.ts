import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('0008 covers the seven RLS scenarios from the database spec', () => {
  const sql = readFileSync(
    path.join(repoRoot, 'supabase/tests/0008_rls_seven_scenarios.sql'),
    'utf8',
  );
  assert.match(sql, /docs\/03-database\.md §7/);
  assert.match(sql, /1 homes: A cannot see B/);
  assert.match(sql, /1 photos: A cannot see B/);
  assert.match(sql, /1 assessments: A cannot see B/);
  assert.match(sql, /1 plans: A cannot see B/);
  assert.match(sql, /1 plan_items: A cannot see B/);
  assert.match(sql, /1 payments: A cannot see B/);
  assert.match(sql, /1 leads: A cannot see B/);
  assert.match(sql, /2 client cannot change profiles\.role/);
  assert.match(sql, /3 unpaid plan shows only two plan_items/);
  assert.match(sql, /3 unlocked plan shows every plan_item/);
  assert.match(sql, /4 client cannot insert plans/);
  assert.match(sql, /4 client cannot insert payments/);
  assert.match(sql, /4 client cannot insert audit_log/);
  assert.match(sql, /5 anon cannot see unpublished rebate_programs/);
  assert.match(sql, /6 non-admin cannot write rebate_programs/);
  assert.match(sql, /7 storage upload outside uid folder is refused/);
});
