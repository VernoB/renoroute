import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PLAN_EVAL_CASES, runPlanEval } from './plan-eval.ts';

test('the eval set has 25 bilingual cases across the four required groups', () => {
  assert.equal(PLAN_EVAL_CASES.length, 25);
  assert.equal(PLAN_EVAL_CASES.filter((row) => row.group === 'home').length, 10);
  assert.equal(PLAN_EVAL_CASES.filter((row) => row.group === 'photo').length, 5);
  assert.equal(PLAN_EVAL_CASES.filter((row) => row.group === 'injection').length, 5);
  assert.equal(PLAN_EVAL_CASES.filter((row) => row.group === 'program').length, 5);
  assert.ok(PLAN_EVAL_CASES.some((row) => row.locale === 'fr'));
  assert.ok(PLAN_EVAL_CASES.some((row) => row.locale === 'en'));
});

test('runPlanEval meets the deterministic M3-06 guard metrics', () => {
  const report = runPlanEval();
  assert.equal(report.failed, 0, JSON.stringify(report.results.filter((row) => !row.pass)));
  assert.equal(report.validJsonRate, 1);
});
