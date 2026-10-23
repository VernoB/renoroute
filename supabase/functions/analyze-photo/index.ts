import {
  parsePhotoObservation,
  photoObservationSchema,
  type PhotoObservation,
} from '../../../packages/shared/src/ai/photo-observation.ts';
import { canGeneratePlan } from '../../../packages/shared/src/consent/plan-consent.ts';
import { hasGpsExif as sharedHasGpsExif } from '../../../packages/shared/src/photos/exif.ts';
import { jpegBytesFromDataUrl, jpegHasGps } from '../../../packages/shared/src/photos/jpeg-exif.ts';
import { generateStructured, type FetchLike } from '../_shared/ai-client.ts';
import { PHOTO_PROMPT_VERSION, PHOTO_SYSTEM_PROMPT } from '../_shared/prompts/photo_v1.ts';

export type AnalyzePhotoInput = {
  ownerId: string;
  photoOwnerId: string;
  imageDataUrl: string;
  category: string;
  exifTags?: Record<string, unknown>;
};

export type AnalyzePhotoOk = {
  ok: true;
  observation: PhotoObservation;
  exif_stripped: true;
  model: string;
  costUsd: number | null;
};

export type AnalyzePhotoErr = {
  ok: false;
  reason:
    | 'forbidden'
    | 'gps'
    | 'no_consent'
    | 'disabled'
    | 'invalid_json'
    | 'error'
    | 'rate_limited';
};

export type LoadedAnalyzePhoto = {
  id: string;
  ownerId: string;
  category: string;
  imageDataUrl: string;
};

export type AnalyzePhotoStore = {
  loadPhoto: (photoId: string, ownerId: string) => Promise<LoadedAnalyzePhoto | null>;
  saveObservation: (
    photoId: string,
    observation: PhotoObservation,
    model: string,
    costUsd: number | null,
  ) => Promise<void>;
  recentAnalyzeCount?: (ownerId: string) => Promise<number>;
  recordAnalyze?: (ownerId: string, photoId: string) => Promise<void>;
};

const ANALYZE_DAILY_LIMIT = 40;

export type AnalyzePhotoResult = AnalyzePhotoOk | AnalyzePhotoErr;

export type AnalyzePhotoDeps = {
  env: Record<string, string | undefined>;
  consentAiAt: string | null;
  fetchImpl?: FetchLike;
};

export function hasGpsExif(exifTags?: Record<string, unknown>): boolean {
  return sharedHasGpsExif(exifTags ?? {});
}

function refusePhoto(input: AnalyzePhotoInput, deps: AnalyzePhotoDeps): AnalyzePhotoErr | null {
  if (input.photoOwnerId !== input.ownerId) {
    return { ok: false, reason: 'forbidden' };
  }
  if (hasGpsExif(input.exifTags) || jpegHasGpsInDataUrl(input.imageDataUrl)) {
    return { ok: false, reason: 'gps' };
  }
  if (!canGeneratePlan({ consentAiAt: deps.consentAiAt })) {
    return { ok: false, reason: 'no_consent' };
  }
  return null;
}

function jpegHasGpsInDataUrl(dataUrl: string): boolean {
  const jpeg = jpegBytesFromDataUrl(dataUrl);
  return jpeg !== null && jpegHasGps(jpeg);
}

function photoMessages(input: AnalyzePhotoInput) {
  return [
    { role: 'system' as const, content: PHOTO_SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: `Declared category: <user_input>${input.category}</user_input> [${PHOTO_PROMPT_VERSION}]`,
        },
        { type: 'image_url' as const, image_url: { url: input.imageDataUrl } },
      ],
    },
  ];
}

function mapAiError(reason: string): AnalyzePhotoErr {
  if (reason === 'disabled' || reason === 'invalid_json') {
    return { ok: false, reason };
  }
  return { ok: false, reason: 'error' };
}

async function observePhoto(
  input: AnalyzePhotoInput,
  deps: AnalyzePhotoDeps,
): Promise<AnalyzePhotoResult> {
  const generated = await generateStructured(photoObservationSchema, photoMessages(input), {
    task: 'vision_observe',
    env: deps.env,
    fetchImpl: deps.fetchImpl,
  });
  if (!generated.ok) {
    return mapAiError(generated.reason);
  }
  const parsed = parsePhotoObservation(generated.value);
  if (!parsed.ok) {
    return { ok: false, reason: 'invalid_json' };
  }
  return {
    ok: true,
    observation: parsed.value,
    exif_stripped: true,
    model: generated.model,
    costUsd: generated.costUsd,
  };
}

/** Returns a photo observation. Never log the image data URL — photos are personal information. */
export async function analyzePhoto(
  input: AnalyzePhotoInput,
  deps: AnalyzePhotoDeps,
): Promise<AnalyzePhotoResult> {
  return refusePhoto(input, deps) ?? observePhoto(input, deps);
}

export async function handleAnalyzePhotoRequest(
  body: unknown,
  deps: AnalyzePhotoDeps & { ownerId: string | null; store?: AnalyzePhotoStore },
): Promise<AnalyzePhotoResult> {
  if (!deps.ownerId) {
    return { ok: false, reason: 'forbidden' };
  }
  if (deps.store?.recentAnalyzeCount) {
    const count = await deps.store.recentAnalyzeCount(deps.ownerId);
    if (count >= ANALYZE_DAILY_LIMIT) {
      return { ok: false, reason: 'rate_limited' };
    }
  }
  const input = await resolveAnalyzeInput(body, deps.ownerId, deps.store);
  if (!input.ok) {
    return input;
  }
  const result = await analyzePhoto(input.value, deps);
  if (result.ok && input.photoId && deps.store) {
    await deps.store.saveObservation(input.photoId, result.observation, result.model, result.costUsd);
    await deps.store.recordAnalyze?.(deps.ownerId, input.photoId);
  }
  return result;
}

async function resolveAnalyzeInput(
  body: unknown,
  ownerId: string,
  store?: AnalyzePhotoStore,
): Promise<
  | { ok: true; value: AnalyzePhotoInput; photoId?: string }
  | AnalyzePhotoErr
> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, reason: 'error' };
  }
  const row = body as Record<string, unknown>;
  if (typeof row.photoId === 'string' && store) {
    const photo = await store.loadPhoto(row.photoId, ownerId);
    if (!photo) {
      return { ok: false, reason: 'forbidden' };
    }
    return {
      ok: true,
      photoId: photo.id,
      value: {
        ownerId,
        photoOwnerId: photo.ownerId,
        imageDataUrl: photo.imageDataUrl,
        category: photo.category,
      },
    };
  }
  if (typeof row.imageDataUrl !== 'string' || typeof row.category !== 'string') {
    return { ok: false, reason: 'error' };
  }
  return {
    ok: true,
    value: {
      ownerId,
      photoOwnerId: typeof row.photoOwnerId === 'string' ? row.photoOwnerId : ownerId,
      imageDataUrl: row.imageDataUrl,
      category: row.category,
      ...(isTagRecord(row.exifTags) ? { exifTags: row.exifTags } : {}),
    },
  };
}

function isTagRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function analyzePhotoHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export function analyzePhotoResponse(result: AnalyzePhotoResult): Response {
  return Response.json(result, { headers: analyzePhotoHeaders() });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return analyzePhotoResponse({ ok: false, reason: 'error' });
    }
    const result = await serveAnalyzePhoto(request, body);
    return analyzePhotoResponse(result);
  });
}

async function serveAnalyzePhoto(request: Request, body: unknown): Promise<AnalyzePhotoResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const { userFromAuthHeader } = await import('../_shared/jwt-user.ts');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');
  const userClient = createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const service = createClient(url, serviceKey);
  const user = await userFromAuthHeader(authHeader, async () => {
    const { data } = await userClient.auth.getUser();
    return data.user ? { id: data.user.id } : null;
  });
  if (!user) {
    return { ok: false, reason: 'forbidden' };
  }
  const { data: profile } = await userClient
    .from('profiles')
    .select('consent_ai_at')
    .eq('id', user.id)
    .maybeSingle();
  return handleAnalyzePhotoRequest(body, {
    env: Deno.env.toObject(),
    ownerId: user.id,
    consentAiAt: typeof profile?.consent_ai_at === 'string' ? profile.consent_ai_at : null,
    store: {
      async loadPhoto(photoId, ownerId) {
        const { data: photo } = await userClient
          .from('home_photos')
          .select('id, owner_id, category, storage_path')
          .eq('id', photoId)
          .eq('owner_id', ownerId)
          .maybeSingle();
        if (!photo) {
          return null;
        }
        const { data: file } = await userClient.storage.from('home-photos').download(photo.storage_path);
        if (!file) {
          return null;
        }
        return {
          id: photo.id,
          ownerId: photo.owner_id,
          category: photo.category,
          imageDataUrl: await blobToDataUrl(file),
        };
      },
      async saveObservation(photoId, observation, model, costUsd) {
        await service
          .from('home_photos')
          .update({
            ai_observations: observation,
            ai_analyzed_at: new Date().toISOString(),
            exif_stripped: true,
          })
          .eq('id', photoId);
        void model;
        void costUsd;
      },
      async recentAnalyzeCount(ownerId) {
        const { data } = await service.rpc('recent_action_count', {
          p_actor: ownerId,
          p_action: 'analyze-photo',
          p_window: '24 hours',
        });
        return typeof data === 'number' ? data : 0;
      },
      async recordAnalyze(ownerId, photoId) {
        await service.from('audit_log').insert({
          actor_id: ownerId,
          action: 'analyze-photo',
          entity: 'home_photos',
          entity_id: photoId,
          metadata: {},
        });
      },
    },
  });
}

async function blobToDataUrl(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${file.type || 'image/jpeg'};base64,${btoa(binary)}`;
}
