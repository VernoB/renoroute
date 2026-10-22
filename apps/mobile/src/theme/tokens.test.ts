import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { borderRadius, elevation, listColorTokens, motion, spacing, typeScale } from './tokens.ts';

const landingCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../landing/tokens.css'),
  'utf8',
);

function expectCss(variable: string, value: string): void {
  const pattern = new RegExp(
    `${variable}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'i',
  );
  assert.match(landingCss, pattern, `${variable} should be ${value} in apps/landing/tokens.css`);
}

test('color tokens match the landing stylesheet', () => {
  for (const { token, hex } of listColorTokens()) {
    expectCss(`--color-${token}`, hex);
  }
});

test('spacing tokens match the landing stylesheet', () => {
  for (const [step, value] of Object.entries(spacing)) {
    expectCss(`--space-${step}`, value);
  }
});

test('radius tokens match the landing stylesheet', () => {
  for (const [name, value] of Object.entries(borderRadius)) {
    expectCss(`--radius-${name}`, value);
  }
});

test('Tailwind receives elevation and motion', () => {
  const config = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../tailwind.config.js'),
    'utf8',
  );
  assert.match(config, /boxShadow: elevation/);
  assert.match(config, /fast: motion\.fast/);
  assert.match(config, /out: motion\.easeOut/);
});

test('elevation and motion tokens match the landing stylesheet', () => {
  for (const [name, value] of Object.entries(elevation)) {
    expectCss(`--elevation-${name}`, value);
  }
  expectCss('--motion-fast', motion.fast);
  expectCss('--motion-base', motion.base);
  expectCss('--motion-slow', motion.slow);
  expectCss('--ease-out', motion.easeOut);
});

test('type scale matches the landing stylesheet', () => {
  const cssNames = [
    'display-xl',
    'display',
    'h1',
    'h2',
    'body',
    'caption',
    'button',
    'overline',
  ] as const;
  for (const name of cssNames) {
    const token = typeScale[name];
    expectCss(`--font-${name}-size`, `${token.size}px`);
    expectCss(`--font-${name}-line`, `${token.lineHeight}px`);
  }
});
