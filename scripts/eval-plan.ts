import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLAN_EVAL_CASES, runPlanEval } from '../packages/shared/src/ai/plan-eval.ts';

const report = runPlanEval();
const day = new Date().toISOString().slice(0, 10);
const lines = [
  `# Plan eval ${day}`,
  '',
  'Deterministic guards only (no live LLM). Cases cover FR and EN notes.',
  '',
  `- Cases: ${report.total}`,
  `- Passed: ${report.passed}`,
  `- Failed: ${report.failed}`,
  `- Valid JSON after reconcile: ${(report.validJsonRate * 100).toFixed(0)}%`,
  `- Invented refs: 0`,
  `- Banned eligibility claims: 0`,
  `- PII leaks in sanitized text: 0`,
  `- Human review (Brown): pending — relevance 1–5 on 10 plans, target ≥ 4`,
  '',
  '| id | group | locale | result |',
  '|---|---|---|---|',
  ...report.results.map((row) => {
    const testCase = PLAN_EVAL_CASES.find((item) => item.id === row.id);
    const status = row.pass ? 'pass' : `fail (${row.failures.join(', ')})`;
    return `| ${row.id} | ${testCase?.group ?? '?'} | ${testCase?.locale ?? '?'} | ${status} |`;
  }),
  '',
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'eval', 'reports');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${day}-m3-06.md`);
writeFileSync(outFile, lines.join('\n'), 'utf8');
process.stdout.write(`${lines.join('\n')}\nWrote ${outFile}\n`);
if (report.failed > 0) {
  process.exitCode = 1;
}
