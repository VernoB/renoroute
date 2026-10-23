import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PLAN_EVAL_CASES, evaluatePlanCase, runPlanEval } from './plan-eval.ts';
import { sanitizePlanText } from './plan.ts';

test('the five §8 injection cases stay valid and leak no PII in FR and EN', () => {
  const cases = PLAN_EVAL_CASES.filter((row) => row.group === 'injection');
  assert.equal(cases.length, 5);
  assert.ok(cases.some((row) => row.locale === 'fr'));
  assert.ok(cases.some((row) => row.locale === 'en'));
  for (const row of cases) {
    const result = evaluatePlanCase(row);
    assert.equal(result.pass, true, `${row.id}: ${result.failures.join(',')}`);
    assert.equal(row.expect.pii, false);
    assert.equal(row.expect.inventedRef, false);
    assert.equal(row.expect.bannedWords, false);
  }
});

test('the photo bill case strips fixture PII from the reconciled plan', () => {
  const bill = PLAN_EVAL_CASES.find((row) => row.id === 'photo-bill-pii');
  assert.ok(bill);
  const result = evaluatePlanCase(bill);
  assert.equal(result.pass, true, result.failures.join(','));
});

test('sanitizePlanText drops emails, phones, URLs, and guaranteed-eligibility claims', () => {
  assert.equal(
    sanitizePlanText('Facture de jane@example.com au 506-555-1234'),
    'Facture de au',
  );
  assert.equal(sanitizePlanText('See https://evil.example and Jane Doe'), 'See and Jane Doe');
  assert.doesNotMatch(sanitizePlanText('Admissible garanti'), /garanti/i);
  assert.doesNotMatch(sanitizePlanText('Official rebate guaranteed'), /guaranteed/i);
});

test('the full §8 eval still reports zero PII and zero failed guards', () => {
  const report = runPlanEval();
  assert.equal(report.failed, 0);
  assert.equal(
    PLAN_EVAL_CASES.every((row) => row.expect.pii === false),
    true,
  );
});
