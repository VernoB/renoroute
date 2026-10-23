import { PHOTO_SYSTEM_PROMPT } from '../_shared/prompts/photo_v1.ts';

import { analyzePhoto, handleAnalyzePhotoRequest } from './index.ts';

const ownerId = 'owner-1';
const imageDataUrl = 'data:image/jpeg;base64,aGVsbG8=';
const consentAiAt = '2026-10-22T12:00:00.000Z';
const env = { AI_API_KEY: 'replace-me', AI_GENERATION_ENABLED: 'true' };

const observation = {
  schema_version: 1 as const,
  category_confirmed: 'window',
  observations: [
    {
      code: 'single_pane_glazing' as const,
      confidence: 'medium' as const,
      note_fr: 'Vitrage simple probable',
      note_en: 'Likely single-pane glazing',
    },
  ],
  equipment: null,
  quality: { usable: true, issue: null },
  pii_detected: false,
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function observationReply(model = 'google/gemini-2.5-flash', cost = 0.01): Response {
  return jsonResponse({
    model,
    usage: { cost },
    choices: [{ message: { content: JSON.stringify(observation) } }],
  });
}

function invalidReply(): Response {
  return jsonResponse({ choices: [{ message: { content: 'not-json' } }] });
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    ownerId,
    photoOwnerId: ownerId,
    imageDataUrl,
    category: 'window',
    ...overrides,
  };
}

Deno.test('returns a photo observation and marks EXIF stripped', async () => {
  let called = false;
  let payload: Record<string, unknown> = {};
  const result = await analyzePhoto(input(), {
    env,
    consentAiAt,
    fetchImpl: (_url, init) => {
      called = true;
      payload = JSON.parse(init.body) as Record<string, unknown>;
      return Promise.resolve(observationReply());
    },
  });
  if (!result.ok || result.exif_stripped !== true || result.costUsd !== 0.01) {
    throw new Error('expected observation with exif_stripped');
  }
  if (result.observation.category_confirmed !== 'window' || !called) {
    throw new Error('expected parsed observation');
  }
  const messages = payload.messages as { role: string; content: unknown }[];
  if (messages[0]?.content !== PHOTO_SYSTEM_PROMPT) {
    throw new Error('expected PHOTO_SYSTEM_PROMPT');
  }
});

Deno.test('refuses another user photo without calling AI', async () => {
  const result = await analyzePhoto(input({ photoOwnerId: 'other-user' }), {
    env,
    consentAiAt,
    fetchImpl: () => {
      throw new Error('AI should not run');
    },
  });
  if (result.ok || result.reason !== 'forbidden') {
    throw new Error('expected forbidden');
  }
});

Deno.test('rejects GPS EXIF without calling AI', async () => {
  const result = await analyzePhoto(
    input({ exifTags: { GPSLatitude: 45.27, GPSLongitude: -66.06 } }),
    {
      env,
      consentAiAt,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
    },
  );
  if (result.ok || result.reason !== 'gps') {
    throw new Error('expected gps');
  }
});

Deno.test('rejects a JPEG whose APP1 still has a GPS IFD', async () => {
  const result = await analyzePhoto(input({ imageDataUrl: gpsJpegDataUrl(), exifTags: undefined }), {
    env,
    consentAiAt,
    fetchImpl: () => {
      throw new Error('AI should not run');
    },
  });
  if (result.ok || result.reason !== 'gps') {
    throw new Error('expected gps from JPEG bytes');
  }
});

Deno.test('returns invalid_json when the model reply stays invalid after retry', async () => {
  let calls = 0;
  const result = await analyzePhoto(input(), {
    env,
    consentAiAt,
    fetchImpl: () => {
      calls += 1;
      return Promise.resolve(invalidReply());
    },
  });
  if (result.ok || result.reason !== 'invalid_json' || calls !== 2) {
    throw new Error('expected invalid_json after retry');
  }
});

Deno.test('handleAnalyzePhotoRequest refuses a missing JWT', async () => {
  const result = await handleAnalyzePhotoRequest(input(), {
    env,
    ownerId: null,
    consentAiAt,
    fetchImpl: () => {
      throw new Error('AI should not run');
    },
  });
  if (result.ok || result.reason !== 'forbidden') {
    throw new Error('expected forbidden');
  }
});

Deno.test('handleAnalyzePhotoRequest loads a photo by id and writes the observation', async () => {
  let saved = false;
  const result = await handleAnalyzePhotoRequest(
    { photoId: 'photo-1' },
    {
      env,
      ownerId,
      consentAiAt,
      fetchImpl: () => Promise.resolve(observationReply()),
      store: {
        loadPhoto: async (photoId, userId) =>
          photoId === 'photo-1' && userId === ownerId
            ? { id: photoId, ownerId, category: 'window', imageDataUrl }
            : null,
        saveObservation: async () => {
          saved = true;
        },
      },
    },
  );
  if (!result.ok || !saved || result.exif_stripped !== true) {
    throw new Error('expected saved observation');
  }
});

Deno.test('handleAnalyzePhotoRequest refuses another user photo id', async () => {
  const result = await handleAnalyzePhotoRequest(
    { photoId: 'photo-2' },
    {
      env,
      ownerId,
      consentAiAt,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
      store: {
        loadPhoto: async () => null,
        saveObservation: async () => {
          throw new Error('must not save');
        },
      },
    },
  );
  if (result.ok || result.reason !== 'forbidden') {
    throw new Error('expected forbidden');
  }
});

function gpsJpegDataUrl(): string {
  const bytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe1, 0x00, 0x24, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4d, 0x4d, 0x00, 0x2a,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x88, 0x25, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
    0x3f, 0x00, 0x00, 0xff, 0xd9,
  ]);
  let binary = '';
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
}
