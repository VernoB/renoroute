import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const seed = readFileSync(path.join(repoRoot, 'supabase/seed.sql'), 'utf8');
const review = readFileSync(path.join(repoRoot, 'docs/rebates-review.md'), 'utf8');

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

test('seed.sql lists the five known programs unpublished', () => {
  for (const slug of slugs) {
    assert.match(seed, new RegExp(`'${slug}'`));
  }
  assert.match(seed, /is_published = false/);
  assert.doesNotMatch(seed, /is_published\s*=\s*true/);
  assert.equal((seed.match(/'2026-10-23', null, null, false,/g) ?? []).length, 4);
  assert.match(seed, /'2026-10-23', null, '2025-10-01', false,/);
});

test('seed.sql uses official https sources and stays a draft', () => {
  assert.doesNotMatch(seed, /TODO-verify-official-url/);
  for (const url of officialUrls) {
    assert.match(seed, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(seed, /'2026-10-23', false/);
  assert.doesNotMatch(seed, /is_active\s*=\s*true/);
});

test('rebates-review.md covers each program in French and English', () => {
  assert.match(review, /## FR/);
  assert.match(review, /## EN/);
  assert.match(review, /is_published = false/);
  assert.match(review, /Aucun programme n’est publié|Aucun programme n'est publié/);
  assert.match(review, /Publish nothing until you approve/i);
  for (const url of officialUrls) {
    assert.match(review, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
