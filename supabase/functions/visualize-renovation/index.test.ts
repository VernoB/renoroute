import { visualizeRenovation } from './index.ts';

const imageDataUrl = 'data:image/jpeg;base64,aGVsbG8=';
const consentAiAt = '2026-10-22T12:00:00.000Z';

Deno.test('refuses visualization without AI consent', async () => {
  const result = await visualizeRenovation(
    { locale: 'fr', imageDataUrl },
    { env: { AI_API_KEY: 'replace-me' }, consentAiAt: null },
  );
  if (result.available || result.reason !== 'no_consent') {
    throw new Error('expected no_consent');
  }
});

Deno.test('returns an after image when OpenRouter provides one', async () => {
  const result = await visualizeRenovation(
    { locale: 'en', imageDataUrl, measureHint: 'windows' },
    {
      env: { AI_API_KEY: 'replace-me' },
      consentAiAt,
      fetchImpl: () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              model: 'google/gemini-2.5-flash-image',
              usage: { cost: 0.04 },
              choices: [
                {
                  message: {
                    images: [{ image_url: { url: 'data:image/png;base64,after' } }],
                  },
                },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
    },
  );
  if (!result.available || result.afterImageDataUrl !== 'data:image/png;base64,after') {
    throw new Error('expected an after image');
  }
});

Deno.test('stays usable when the model cannot draw an after image', async () => {
  const result = await visualizeRenovation(
    { locale: 'fr', imageDataUrl },
    {
      env: { AI_API_KEY: 'replace-me' },
      consentAiAt,
      fetchImpl: () =>
        Promise.resolve(
          new Response(JSON.stringify({ choices: [{ message: { content: 'no' } }] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    },
  );
  if (result.available || result.reason !== 'model_unavailable') {
    throw new Error('expected model_unavailable');
  }
});
