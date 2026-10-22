import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Email OTP field from Supabase email-template docs (`{{ .Token }}`).
 * `supabase/config.toml` only names `{{ .Code }}` on the SMS templates.
 */
const EMAIL_OTP_FIELD = '{{ .Token }}';

const TEMPLATE_FILES = [
  'supabase/templates/email/otp-fr.html',
  'supabase/templates/email/otp-en.html',
] as const;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function readRepoFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), 'utf8');
}

function secretProblem(text: string): string | undefined {
  if (text.includes('sk_')) {
    return 'sk_';
  }
  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text)) {
    return 'service_role jwt';
  }
  const password = /password\s*=\s*([^\s"'<>]+)/i.exec(text);
  const value = password?.[1];
  if (value !== undefined && !value.startsWith('replace-with-')) {
    return 'password';
  }
  return undefined;
}

describe('OTP email templates', () => {
  it('ships a French and an English body with the email OTP field', () => {
    const french = readRepoFile(TEMPLATE_FILES[0]);
    const english = readRepoFile(TEMPLATE_FILES[1]);

    assert.match(french, /lang="fr-CA"/);
    assert.match(english, /lang="en-CA"/);
    assert.match(french, /<!-- subject: Votre code de connexion : \{\{ \.Token \}\} -->/);
    assert.match(english, /<!-- subject: Your sign-in code: \{\{ \.Token \}\} -->/);
    assert.equal((french.match(/\{\{ \.Token \}\}/g) ?? []).length >= 2, true);
    assert.equal((english.match(/\{\{ \.Token \}\}/g) ?? []).length >= 2, true);
    assert.equal(french.includes(EMAIL_OTP_FIELD), true);
    assert.equal(english.includes(EMAIL_OTP_FIELD), true);
    assert.equal(secretProblem(french), undefined);
    assert.equal(secretProblem(english), undefined);
  });

  it('keeps SMTP settings commented placeholders and does not enable Auth SMTP', () => {
    const env = readRepoFile('.env.example');
    const config = readRepoFile('supabase/config.toml');
    const commented = [
      '# SMTP_HOST=replace-with-smtp-host',
      '# SMTP_PORT=replace-with-smtp-port',
      '# SMTP_USER=replace-with-smtp-user',
      '# SMTP_PASS=replace-with-smtp-password',
      '# SMTP_SENDER=replace-with-sender-address',
    ];

    for (const line of commented) {
      assert.equal(env.includes(line), true, line);
    }
    assert.equal(/^SMTP_(HOST|PORT|USER|PASS|SENDER)=/m.test(env), false);
    assert.equal(secretProblem(env.split('Auth email SMTP')[1] ?? ''), undefined);
    assert.equal(/^\[auth\.email\.smtp\]/m.test(config), false);
    assert.equal(/^\[auth\.email\.template\.magic_link\]/m.test(config), false);
  });
});
