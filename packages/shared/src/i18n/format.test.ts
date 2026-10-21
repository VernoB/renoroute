import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCad, formatShortDate } from './format.ts';

const sampleDate = new Date(Date.UTC(2026, 9, 19));

function visibleSpaces(value: string): string {
  return value.replace(/[\u00a0\u202f]/g, ' ');
}

describe('Canadian Intl formats', () => {
  it('formats CAD for fr-CA and en-CA', () => {
    assert.equal(visibleSpaces(formatCad(1234.56, 'fr')), '1 234,56 $');
    assert.equal(formatCad(1234.56, 'en'), '$1,234.56');
  });

  it('formats a short date for fr-CA and en-CA', () => {
    assert.equal(formatShortDate(sampleDate, 'fr'), '19 oct. 2026');
    assert.equal(formatShortDate(sampleDate, 'en'), 'Oct 19, 2026');
  });
});
