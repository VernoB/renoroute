import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MAX_VOICE_SECONDS, parseTranscribeInput } from './transcription.ts';

test('accepts a bilingual note at the two-minute cap', () => {
  const parsed = parseTranscribeInput({ locale: 'fr', durationSeconds: MAX_VOICE_SECONDS });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.locale, 'fr');
    assert.equal(parsed.value.durationSeconds, 120);
  }
});

test('rejects a note longer than two minutes', () => {
  const parsed = parseTranscribeInput({ locale: 'en', durationSeconds: MAX_VOICE_SECONDS + 1 });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.reason, 'too_long');
  }
});

test('rejects a missing locale or duration', () => {
  assert.equal(parseTranscribeInput({ durationSeconds: 30 }).ok, false);
  assert.equal(parseTranscribeInput({ locale: 'en' }).ok, false);
  const invalid = parseTranscribeInput({ locale: 'de', durationSeconds: 10 });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.reason, 'invalid');
  }
});
