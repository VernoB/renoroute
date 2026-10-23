import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  parseBenchmarkInput,
  parseRebateProgramInput,
  parseRebateRuleInput,
} from './admin-input.ts';

const programDraft = {
  slug: 'nbp-total-home-energy-savings',
  administrator: 'NB Power',
  nameFr: "Programme d'économies d'énergie pour toute la maison",
  nameEn: 'Total Home Energy Savings Program',
  status: 'open',
  requiresPreEvaluation: true,
  preEvaluationFeeCad: 99,
  preEvaluationFeeNote: '+HST',
  completionWindowMonths: 9,
  sourceUrl: 'https://TODO-verify-official-url',
  lastVerifiedAt: '2026-10-19',
};

const ruleDraft = {
  programId: '11111111-1111-4111-8111-111111111111',
  measure: 'mini_split_heat_pump',
  amountType: 'fixed',
  amountMinCad: 400,
  amountMaxCad: 400,
  sourceUrl: 'https://TODO-verify-official-url',
  lastVerifiedAt: '2026-10-19',
  conditions: { requires_program_pre_evaluation: true },
};

const benchmarkDraft = {
  province: 'CA',
  measure: 'air_sealing',
  costLowCad: 350,
  costHighCad: 1500,
  costUnit: 'project',
  sourceUrl: 'https://www.homestars.com/insulation/price-guides/attic-insulation-cost',
  lastVerifiedAt: '2026-10-23',
};

test('parseRebateProgramInput accepts an unpublished bilingual draft', () => {
  const parsed = parseRebateProgramInput(programDraft);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) {
    return;
  }
  assert.equal(parsed.value.jurisdiction, 'NB');
  assert.equal(parsed.value.isPublished, false);
  assert.equal(parsed.value.sourceUrl.startsWith('https://'), true);
  assert.equal(parsed.value.nameFr.length > 0, true);
  assert.equal(parsed.value.nameEn.length > 0, true);
});

test('parseRebateProgramInput rejects http sources, bad slugs, and inverted dates', () => {
  assert.equal(
    parseRebateProgramInput({ ...programDraft, sourceUrl: 'http://example.com' }).ok,
    false,
  );
  assert.equal(parseRebateProgramInput({ ...programDraft, slug: 'NB Power' }).ok, false);
  assert.equal(
    parseRebateProgramInput({
      ...programDraft,
      opensOn: '2027-01-02',
      closesOn: '2027-01-01',
    }).ok,
    false,
  );
});

test('parseRebateRuleInput accepts a rule and rejects inverted amounts or invented conditions', () => {
  const parsed = parseRebateRuleInput(ruleDraft);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.isActive, false);
    assert.equal(parsed.value.conditions.requires_program_pre_evaluation, true);
  }
  assert.equal(
    parseRebateRuleInput({ ...ruleDraft, amountMinCad: 500, amountMaxCad: 100 }).ok,
    false,
  );
  assert.equal(
    parseRebateRuleInput({
      ...ruleDraft,
      conditions: { guaranteed_eligible: true },
    }).ok,
    false,
  );
  assert.equal(parseRebateRuleInput({ ...ruleDraft, measure: 'skirting' }).ok, false);
});

test('parseBenchmarkInput accepts a Canada-wide row and keeps it unpublished by default', () => {
  const parsed = parseBenchmarkInput(benchmarkDraft);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) {
    return;
  }
  assert.equal(parsed.value.isActive, false);
  assert.equal(parsed.value.province, 'CA');
  assert.equal(
    parseBenchmarkInput({ ...benchmarkDraft, costLowCad: 2000, costHighCad: 100 }).ok,
    false,
  );
  assert.equal(
    parseBenchmarkInput({ ...benchmarkDraft, savingsPctLow: 20, savingsPctHigh: 5 }).ok,
    false,
  );
  assert.equal(parseBenchmarkInput({ ...benchmarkDraft, costUnit: 'room' }).ok, false);
  assert.equal(parseBenchmarkInput({ ...benchmarkDraft, sourceUrl: 'not-a-url' }).ok, false);
});
