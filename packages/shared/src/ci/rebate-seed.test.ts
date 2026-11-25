import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const seed = readFileSync(path.join(repoRoot, 'supabase/seed.sql'), 'utf8');
const review = readFileSync(path.join(repoRoot, 'docs/rebates-review.md'), 'utf8');
const config = readFileSync(path.join(repoRoot, 'supabase/config.toml'), 'utf8');

const slugs = [
  'nbp-total-home-energy-savings',
  'nbp-enhanced-energy-savings',
  'ca-greener-homes-loan',
  'ca-national-heat-pump-rebate',
  'sje-heat-pump-rental-financing',
] as const;

const officialUrls = [
  'https://www.saveenergynb.ca/for-home/total-home/',
  'https://www.saveenergynb.ca/en/for-home/enhanced-energy-savings-program/faqs/',
  'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan',
  'https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html',
  'https://sjenergy.ca/products-and-services/heat-pump-rentals',
] as const;

test('seed.sql publishes the four live programs and keeps the closed loan unpublished', () => {
  for (const slug of slugs) {
    assert.match(seed, new RegExp(`'${slug}'`));
  }
  assert.equal((seed.match(/'2026-10-23', null, null, true,/g) ?? []).length, 3);
  assert.match(seed, /'2026-11-22', null, null, true,/);
  assert.match(seed, /'announced'/);
  assert.match(seed, /early 2027/);
  assert.match(seed, /'2026-10-23', null, '2025-10-01', false,/);
  assert.match(seed, /Stays unpublished \(closed\)/);
});

test('seed.sql uses official https sources', () => {
  assert.doesNotMatch(seed, /TODO-verify-official-url/);
  for (const url of officialUrls) {
    assert.match(seed, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('published program rules are active and the closed loan rule is not', () => {
  assert.match(seed, /v.is_active/);
  assert.match(seed, /canada-greener-homes-loan',\n {6}false/);
  assert.equal((seed.match(/incentives\/',\n {6}true/g) ?? []).length >= 8, true);
});

test('rebates-review.md records Brown publish in French and English', () => {
  assert.match(review, /## FR/);
  assert.match(review, /## EN/);
  assert.match(review, /Brown a publié|Published/);
  assert.match(review, /`ca-greener-homes-loan` \| non/);
  for (const url of officialUrls) {
    assert.match(review, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('db.seed is enabled after Brown publish', () => {
  assert.match(config, /\[db\.seed\][\s\S]*enabled = true/);
  assert.match(config, /sql_paths = \["\.\/seed\.sql"\]/);
});
