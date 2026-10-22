import {
  autoRouterPlugin,
  isAiGenerationEnabled,
  selectModel,
  type AiEnv,
  type AiTask,
} from '../../../packages/shared/src/ai/tasks.ts';
import { BRAND } from '../../../packages/shared/src/config/brand.ts';

export const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatContentPart[];
};

export type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  },
) => Promise<Response>;

type ZodLike<T> = {
  safeParse: (
    value: unknown,
  ) => { success: true; data: T } | { success: false; error: { issues: { message?: string }[] } };
};

export type StructuredOk<T> = {
  ok: true;
  value: T;
  model: string;
  costUsd: number | null;
};

export type TransportErr = {
  ok: false;
  reason: 'disabled' | 'missing_key' | 'http_error' | 'timeout';
};

export type StructuredErr = TransportErr | { ok: false; reason: 'invalid_json' };

export type ImageOk = {
  ok: true;
  imageDataUrl: string;
  model: string;
  costUsd: number | null;
};

export type ImageErr = TransportErr | { ok: false; reason: 'model_unavailable' };

function apiKey(env: AiEnv): string | undefined {
  const key = env.OPENROUTER_API_KEY?.trim() || env.AI_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

function headers(env: AiEnv): Record<string, string> | null {
  const key = apiKey(env);
  if (!key) {
    return null;
  }
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': BRAND.websiteUrl,
    'X-Title': BRAND.name,
  };
}

function readCost(payload: unknown): number | null {
  if (typeof payload !== 'object' || payload === null || !('usage' in payload)) {
    return null;
  }
  const usage = (payload as { usage?: { cost?: unknown } }).usage;
  return typeof usage?.cost === 'number' && Number.isFinite(usage.cost) ? usage.cost : null;
}

function readModel(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'model' in payload) {
    const model = (payload as { model?: unknown }).model;
    if (typeof model === 'string' && model.length > 0) {
      return model;
    }
  }
  return fallback;
}

function readTextContent(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('choices' in payload)) {
    return null;
  }
  const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content;
  }
  if (!Array.isArray(content)) {
    return null;
  }
  const texts = content
    .map((part) =>
      typeof part === 'object' && part !== null && 'text' in part
        ? String((part as { text?: unknown }).text ?? '')
        : '',
    )
    .filter((part) => part.length > 0);
  return texts.length > 0 ? texts.join('\n') : null;
}

function parseJsonContent(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(trimmed) as unknown;
}

function readImageDataUrl(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('choices' in payload)) {
    return null;
  }
  const message = (payload as { choices?: { message?: Record<string, unknown> }[] }).choices?.[0]
    ?.message;
  if (!message) {
    return null;
  }
  const images = message.images;
  if (Array.isArray(images)) {
    for (const image of images) {
      if (typeof image !== 'object' || image === null) {
        continue;
      }
      const url = (image as { image_url?: { url?: unknown } }).image_url?.url;
      if (typeof url === 'string' && url.startsWith('data:image/')) {
        return url;
      }
    }
  }
  const content = message.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part !== 'object' || part === null) {
        continue;
      }
      const url = (part as { image_url?: { url?: unknown } }).image_url?.url;
      if (typeof url === 'string' && url.startsWith('data:image/')) {
        return url;
      }
    }
  }
  return null;
}

async function postChat(
  env: AiEnv,
  task: AiTask,
  body: Record<string, unknown>,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<{ ok: true; payload: unknown; model: string } | TransportErr> {
  if (!isAiGenerationEnabled(env)) {
    return { ok: false, reason: 'disabled' };
  }
  const requestHeaders = headers(env);
  if (!requestHeaders) {
    return { ok: false, reason: 'missing_key' };
  }
  const model = selectModel(task, env);
  const plugin = autoRouterPlugin(task, model);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(OPENROUTER_CHAT_URL, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        model,
        ...(plugin ? { plugins: [plugin] } : {}),
        ...body,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, reason: 'http_error' };
    }
    const payload: unknown = await response.json();
    return { ok: true, payload, model: readModel(payload, model) };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'http_error' };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateStructured<T>(
  schema: ZodLike<T>,
  messages: ChatMessage[],
  options: {
    task: AiTask;
    env?: AiEnv;
    fetchImpl?: FetchLike;
    timeoutMs?: number;
  },
): Promise<StructuredOk<T> | StructuredErr> {
  const env = options.env ?? {};
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 45_000;

  const first = await postChat(
    env,
    options.task,
    { messages, response_format: { type: 'json_object' } },
    fetchImpl,
    timeoutMs,
  );
  if (!first.ok) {
    return first;
  }
  const parsed = parseStructured(schema, first.payload);
  if (parsed) {
    return { ok: true, value: parsed, model: first.model, costUsd: readCost(first.payload) };
  }

  const retry = await postChat(
    env,
    options.task,
    {
      messages: [
        ...messages,
        {
          role: 'user',
          content: 'Return valid JSON only that matches the required schema. No markdown.',
        },
      ],
      response_format: { type: 'json_object' },
    },
    fetchImpl,
    timeoutMs,
  );
  if (!retry.ok) {
    return retry;
  }
  const retried = parseStructured(schema, retry.payload);
  if (!retried) {
    return { ok: false, reason: 'invalid_json' };
  }
  return { ok: true, value: retried, model: retry.model, costUsd: readCost(retry.payload) };
}

function parseStructured<T>(schema: ZodLike<T>, payload: unknown): T | null {
  const raw = readTextContent(payload);
  if (!raw) {
    return null;
  }
  try {
    const parsed = schema.safeParse(parseJsonContent(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function generateImage(options: {
  task: Extract<AiTask, 'image_preview'>;
  messages: ChatMessage[];
  env?: AiEnv;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<ImageOk | ImageErr> {
  const env = options.env ?? {};
  const result = await postChat(
    env,
    options.task,
    { messages: options.messages, modalities: ['image', 'text'] },
    options.fetchImpl ?? fetch,
    options.timeoutMs ?? 60_000,
  );
  if (!result.ok) {
    return result;
  }
  const imageDataUrl = readImageDataUrl(result.payload);
  if (!imageDataUrl) {
    return { ok: false, reason: 'model_unavailable' };
  }
  return {
    ok: true,
    imageDataUrl,
    model: result.model,
    costUsd: readCost(result.payload),
  };
}
