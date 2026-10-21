import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const watchedAttributes = [
  'accessibilityLabel',
  'accessibilityHint',
  'placeholder',
  'title',
] as const;

type LintMessage = { ruleId: string | null; line: number };

function lintSnippet(code: string): LintMessage[] {
  const eslintBin = path.join(repoRoot, 'node_modules/eslint/bin/eslint.js');
  const result = spawnSync(
    process.execPath,
    [
      eslintBin,
      '--no-ignore',
      '--stdin',
      '--stdin-filename',
      'apps/mobile/src/i18n-literal-fixture.tsx',
      '--format',
      'json',
    ],
    { cwd: repoRoot, input: code, encoding: 'utf8' },
  );
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, null, result.stderr);
  const parsed = JSON.parse(result.stdout) as Array<{ messages: LintMessage[] }>;
  const file = parsed[0];
  assert.ok(file);
  return file.messages.filter((message) => message.ruleId === 'i18next/no-literal-string');
}

describe('literal strings in accessible attributes', () => {
  it('fails when accessibility text is hardcoded', () => {
    const messages = lintSnippet(`export function Fixture() {
  return (
    <View
      className="flex"
      accessibilityLabel="Fermer"
      accessibilityHint="Fermer"
      placeholder="Fermer"
      title="Fermer"
    />
  );
}
`);
    const lines = new Set(messages.map((message) => message.line));
    assert.equal(messages.length, watchedAttributes.length);
    assert.equal(lines.has(4), false);
    for (const line of [5, 6, 7, 8]) {
      assert.equal(lines.has(line), true);
    }
  });

  it('allows the same attributes when they use t()', () => {
    const messages = lintSnippet(`export function Fixture() {
  return (
    <View
      accessibilityLabel={t('common.close')}
      accessibilityHint={t('common.close')}
      placeholder={t('common.close')}
      title={t('common.close')}
    />
  );
}
`);
    assert.deepEqual(messages, []);
  });
});

describe('fallbackLocale', () => {
  it('is exported once from the mobile i18n module', () => {
    const i18n = readFileSync(path.join(repoRoot, 'apps/mobile/src/lib/i18n.ts'), 'utf8');
    const preference = readFileSync(
      path.join(repoRoot, 'apps/mobile/src/lib/locale-preference.ts'),
      'utf8',
    );
    assert.match(i18n, /export function fallbackLocale\(/);
    assert.doesNotMatch(preference, /function fallbackLocale\(/);
    assert.match(preference, /fallbackLocale/);
  });
});
