import { photoObservationSchema } from '../../../packages/shared/src/ai/photo-observation.ts';
import { OPENROUTER_AUTO_MODEL } from '../../../packages/shared/src/ai/tasks.ts';

import { generateImage, generateStructured, generateText, OPENROUTER_CHAT_URL } from './ai-client.ts';

const env = { AI_API_KEY: 'replace-me', AI_GENERATION_ENABLED: 'true' };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.test('generateStructured sends Auto Router and parses JSON', async () => {
  let url = '';
  let payload: Record<string, unknown> = {};
  const result = await generateStructured(
    photoObservationSchema,
    [{ role: 'user', content: 'describe' }],
    {
      task: 'vision_observe',
      env,
      fetchImpl: (input, init) => {
        url = input;
        payload = JSON.parse(init.body) as Record<string, unknown>;
        return Promise.resolve(
          jsonResponse({
            model: 'google/gemini-2.5-flash',
            usage: { cost: 0.01 },
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    schema_version: 1,
                    category_confirmed: 'window',
                    observations: [],
                    equipment: null,
                    quality: { usable: true, issue: null },
                    pii_detected: false,
                  }),
                },
              },
            ],
          }),
        );
      },
    },
  );
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.reason}`);
  }
  if (url !== OPENROUTER_CHAT_URL) {
    throw new Error('did not call OpenRouter');
  }
  if (payload.model !== OPENROUTER_AUTO_MODEL) {
    throw new Error('did not use Auto Router');
  }
  const plugin = (payload.plugins as { id?: string; cost_tier?: string }[] | undefined)?.[0];
  if (plugin?.id !== 'auto-router' || plugin.cost_tier !== 'high') {
    throw new Error('did not ask Auto Router for the best vision model');
  }
  if (result.costUsd !== 0.01) {
    throw new Error('did not record cost');
  }
});

Deno.test('generateStructured is off when the kill switch is set', async () => {
  const result = await generateStructured(photoObservationSchema, [], {
    task: 'plan_write',
    env: { ...env, AI_GENERATION_ENABLED: 'false' },
    fetchImpl: () => {
      throw new Error('network should not run');
    },
  });
  if (result.ok || result.reason !== 'disabled') {
    throw new Error('kill switch was ignored');
  }
});

Deno.test('generateImage returns unavailable when no image is in the reply', async () => {
  const result = await generateImage({
    task: 'image_preview',
    env,
    messages: [{ role: 'user', content: 'after' }],
    fetchImpl: () =>
      Promise.resolve(
        jsonResponse({
          model: 'openrouter/auto',
          choices: [{ message: { content: 'I cannot draw that' } }],
        }),
      ),
  });
  if (result.ok || result.reason !== 'model_unavailable') {
    throw new Error('missing image should be model_unavailable');
  }
});

Deno.test('generateText sends Auto Router for transcribe and returns text', async () => {
  let url = '';
  let payload: Record<string, unknown> = {};
  const result = await generateText({
    task: 'transcribe',
    env,
    messages: [{ role: 'user', content: 'voice note' }],
    fetchImpl: (input, init) => {
      url = input;
      payload = JSON.parse(init.body) as Record<string, unknown>;
      return Promise.resolve(
        jsonResponse({
          model: 'openai/gpt-4o-mini',
          usage: { cost: 0.002 },
          choices: [{ message: { content: 'furnace is old' } }],
        }),
      );
    },
  });
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.reason}`);
  }
  if (url !== OPENROUTER_CHAT_URL) {
    throw new Error('did not call OpenRouter');
  }
  if (payload.model !== OPENROUTER_AUTO_MODEL) {
    throw new Error('did not use Auto Router');
  }
  const plugin = (payload.plugins as { id?: string; cost_tier?: string }[] | undefined)?.[0];
  if (plugin?.id !== 'auto-router' || plugin.cost_tier !== 'low') {
    throw new Error('did not ask Auto Router for a low-cost transcribe model');
  }
  if (result.text !== 'furnace is old' || result.costUsd !== 0.002) {
    throw new Error('did not return the transcript text');
  }
});

Deno.test('generateText is off when the kill switch is set', async () => {
  const result = await generateText({
    task: 'transcribe',
    env: { ...env, AI_GENERATION_ENABLED: 'false' },
    messages: [{ role: 'user', content: 'voice note' }],
    fetchImpl: () => {
      throw new Error('network should not run');
    },
  });
  if (result.ok || result.reason !== 'disabled') {
    throw new Error('kill switch was ignored');
  }
});

Deno.test('generateImage reads a data URL from the reply', async () => {
  const result = await generateImage({
    task: 'image_preview',
    env,
    messages: [{ role: 'user', content: 'after' }],
    fetchImpl: (_input, init) => {
      const body = JSON.parse(init.body) as { plugins?: { id?: string }[] };
      if (body.plugins?.[0]?.id !== 'auto-router') {
        return Promise.resolve(jsonResponse({}, 500));
      }
      return Promise.resolve(
        jsonResponse({
          model: 'google/gemini-2.5-flash-image',
          choices: [
            {
              message: {
                images: [{ image_url: { url: 'data:image/png;base64,abc' } }],
              },
            },
          ],
        }),
      );
    },
  });
  if (!result.ok || result.imageDataUrl !== 'data:image/png;base64,abc') {
    throw new Error('did not extract the after image');
  }
});
