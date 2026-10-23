import { transcribeVoiceNote } from './index.ts';

const consentAiAt = '2026-10-22T12:00:00.000Z';

function mockTranscript(text: string) {
  return () =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          model: 'openai/gpt-4o-mini',
          choices: [{ message: { content: text } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
}

Deno.test('refuses transcription without AI consent', async () => {
  const result = await transcribeVoiceNote(
    { locale: 'fr', durationSeconds: 30 },
    { env: { AI_API_KEY: 'replace-me' }, consentAiAt: null },
  );
  if (result.ok || result.reason !== 'no_consent') {
    throw new Error('expected no_consent');
  }
});

Deno.test('rejects a voice note longer than two minutes', async () => {
  const result = await transcribeVoiceNote(
    { locale: 'en', durationSeconds: 121 },
    { env: { AI_API_KEY: 'replace-me' }, consentAiAt },
  );
  if (result.ok || result.reason !== 'too_long') {
    throw new Error('expected too_long');
  }
});

Deno.test('returns a transcript and deletes audio by default without storage', async () => {
  const result = await transcribeVoiceNote(
    { locale: 'fr', durationSeconds: 45 },
    {
      env: { AI_API_KEY: 'replace-me' },
      consentAiAt,
      fetchImpl: mockTranscript('la fournaise est vieille'),
    },
  );
  if (!result.ok || result.transcript !== 'la fournaise est vieille' || result.audioDeleted !== true) {
    throw new Error('expected transcript with audioDeleted true');
  }
});

Deno.test('keeps audio when deleteAfterTranscribe is false', async () => {
  const result = await transcribeVoiceNote(
    { locale: 'en', durationSeconds: 20, deleteAfterTranscribe: false },
    {
      env: { AI_API_KEY: 'replace-me' },
      consentAiAt,
      fetchImpl: mockTranscript('windows feel drafty'),
    },
  );
  if (!result.ok || result.audioDeleted !== false) {
    throw new Error('expected audioDeleted false');
  }
});
