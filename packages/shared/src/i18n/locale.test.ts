import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveLocale } from './locale.ts';

describe('resolveLocale', () => {
  it('keeps a saved choice over the device language', () => {
    assert.equal(resolveLocale({ saved: 'en', deviceLanguage: 'fr' }), 'en');
    assert.equal(resolveLocale({ saved: 'fr-CA', deviceLanguage: 'en' }), 'fr');
  });

  it('uses the device language when nothing is saved', () => {
    assert.equal(resolveLocale({ saved: null, deviceLanguage: 'en-CA' }), 'en');
    assert.equal(resolveLocale({ saved: '', deviceLanguage: 'fr' }), 'fr');
  });

  it('falls back to French when the device language is unsupported', () => {
    assert.equal(resolveLocale({ saved: 'de', deviceLanguage: 'es' }), 'fr');
    assert.equal(resolveLocale({ saved: null, deviceLanguage: null }), 'fr');
  });

  it('accepts an explicit fallback', () => {
    assert.equal(resolveLocale({ saved: null, deviceLanguage: 'es', fallback: 'en' }), 'en');
  });
});
