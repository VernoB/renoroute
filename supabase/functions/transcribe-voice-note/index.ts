import {
  parseTranscribeInput,
  type TranscribeInput,
} from '../../../packages/shared/src/ai/transcription.ts';
import { canGeneratePlan } from '../../../packages/shared/src/consent/plan-consent.ts';
import { generateText, type FetchLike } from '../_shared/ai-client.ts';
import {
  TRANSCRIBE_PROMPT_VERSION,
  TRANSCRIBE_SYSTEM_PROMPT,
  transcribeUserPrompt,
} from '../_shared/prompts/transcribe_v1.ts';

export type TranscribeVoiceNoteOk = {
  ok: true;
  transcript: string;
  audioDeleted: boolean;
};

export type TranscribeVoiceNoteErr = {
  ok: false;
  reason: 'no_consent' | 'too_long' | 'invalid' | 'disabled' | 'error';
};

export type TranscribeVoiceNoteResult = TranscribeVoiceNoteOk | TranscribeVoiceNoteErr;

export type TranscribeVoiceNoteDeps = {
  env: Record<string, string | undefined>;
  consentAiAt: string | null;
  fetchImpl?: FetchLike;
};

export function transcribeVoiceNoteHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export async function transcribeVoiceNote(
  body: unknown,
  deps: TranscribeVoiceNoteDeps,
): Promise<TranscribeVoiceNoteResult> {
  if (!canGeneratePlan({ consentAiAt: deps.consentAiAt })) {
    return { ok: false, reason: 'no_consent' };
  }
  const parsed = parseTranscribeInput(body);
  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason };
  }
  return completeTranscribe(parsed.value, body, deps);
}

async function completeTranscribe(
  input: TranscribeInput,
  body: unknown,
  deps: TranscribeVoiceNoteDeps,
): Promise<TranscribeVoiceNoteResult> {
  const generated = await generateText({
    task: 'transcribe',
    env: deps.env,
    fetchImpl: deps.fetchImpl,
    messages: transcribeMessages(input),
  });
  if (!generated.ok) {
    return { ok: false, reason: generated.reason === 'disabled' ? 'disabled' : 'error' };
  }
  return { ok: true, transcript: generated.text, audioDeleted: deleteAfterTranscribe(body) };
}

function transcribeMessages(input: TranscribeInput) {
  return [
    { role: 'system' as const, content: TRANSCRIBE_SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `${transcribeUserPrompt(input.locale, input.durationSeconds)} [${TRANSCRIBE_PROMPT_VERSION}]`,
    },
  ];
}

export function transcribeVoiceNoteResponse(result: TranscribeVoiceNoteResult): Response {
  return Response.json(result, { headers: transcribeVoiceNoteHeaders() });
}

function deleteAfterTranscribe(body: unknown): boolean {
  if (typeof body !== 'object' || body === null || !('deleteAfterTranscribe' in body)) {
    return true;
  }
  return (body as { deleteAfterTranscribe?: unknown }).deleteAfterTranscribe !== false;
}

async function serveTranscribeVoiceNote(
  request: Request,
  body: unknown,
): Promise<TranscribeVoiceNoteResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const { userFromAuthHeader } = await import('../_shared/jwt-user.ts');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');
  const userClient = createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const user = await userFromAuthHeader(authHeader, async () => {
    const { data } = await userClient.auth.getUser();
    return data.user ? { id: data.user.id } : null;
  });
  if (!user) {
    return { ok: false, reason: 'no_consent' };
  }
  const { data: profile } = await userClient
    .from('profiles')
    .select('consent_ai_at')
    .eq('id', user.id)
    .maybeSingle();
  return transcribeVoiceNote(body, {
    env: Deno.env.toObject(),
    consentAiAt: typeof profile?.consent_ai_at === 'string' ? profile.consent_ai_at : null,
  });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return transcribeVoiceNoteResponse({ ok: false, reason: 'invalid' });
    }
    const result = await serveTranscribeVoiceNote(request, body);
    return transcribeVoiceNoteResponse(result);
  });
}
