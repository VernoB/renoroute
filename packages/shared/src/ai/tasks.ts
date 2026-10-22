/** AI work the server can ask OpenRouter to route. */
export const AI_TASKS = ['vision_observe', 'plan_write', 'image_preview', 'transcribe'] as const;

export type AiTask = (typeof AI_TASKS)[number];

/** OpenRouter Auto Router picks a current best model for the prompt. */
export const OPENROUTER_AUTO_MODEL = 'openrouter/auto';

export type AutoCostTier = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export type AutoRouterPlugin = {
  id: 'auto-router';
  allowed_models: readonly string[];
  cost_tier: AutoCostTier;
};

/**
 * Image-capable slugs the Auto Router may choose among.
 * TODO(verify): confirm slugs on https://openrouter.ai/api/v1/models?output_modalities=image
 */
export const IMAGE_PREVIEW_ALLOWED_MODELS = [
  'google/gemini-2.5-flash-image',
  'google/gemini-2.5-flash-image-preview',
  'black-forest-labs/flux.2-flex',
  'openai/gpt-5-image-mini',
] as const;

/** Families OpenRouter may pick from. Wildcards stay current as new slugs appear. */
export const TASK_AUTO_ROUTES: Record<AiTask, AutoRouterPlugin> = {
  vision_observe: {
    id: 'auto-router',
    allowed_models: ['openai/*', 'google/*', 'anthropic/*'],
    cost_tier: 'high',
  },
  plan_write: {
    id: 'auto-router',
    allowed_models: ['anthropic/*', 'openai/*', 'google/*'],
    cost_tier: 'high',
  },
  image_preview: {
    id: 'auto-router',
    allowed_models: IMAGE_PREVIEW_ALLOWED_MODELS,
    cost_tier: 'medium',
  },
  transcribe: {
    id: 'auto-router',
    allowed_models: ['openai/*', 'google/*'],
    cost_tier: 'low',
  },
};

export const TASK_MODEL_ENV: Record<AiTask, string> = {
  vision_observe: 'AI_VISION_MODEL',
  plan_write: 'AI_PLAN_MODEL',
  image_preview: 'AI_IMAGE_MODEL',
  transcribe: 'AI_TRANSCRIBE_MODEL',
};

export type AiEnv = Record<string, string | undefined>;

export function readFlag(env: AiEnv, name: string, fallback: boolean): boolean {
  const raw = env[name];
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  return raw.trim().toLowerCase() !== 'false' && raw.trim() !== '0';
}

export function usesAutoRouter(model: string): boolean {
  return model === OPENROUTER_AUTO_MODEL || model === 'openrouter/auto-beta';
}

function pinnedModel(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0 || usesAutoRouter(trimmed) || /replace[-_]?me/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/** Always Auto Router unless a real slug is set in secrets. */
export function selectModel(task: AiTask, env: AiEnv = {}): string {
  return pinnedModel(env[TASK_MODEL_ENV[task]]) ?? OPENROUTER_AUTO_MODEL;
}

/** Sent with every Auto request so OpenRouter picks the best model for that task. */
export function autoRouterPlugin(
  task: AiTask,
  model: string = OPENROUTER_AUTO_MODEL,
): AutoRouterPlugin | null {
  if (!usesAutoRouter(model)) {
    return null;
  }
  return TASK_AUTO_ROUTES[task];
}

export function isAiGenerationEnabled(env: AiEnv): boolean {
  return readFlag(env, 'AI_GENERATION_ENABLED', true);
}

export function isImagePreviewEnabled(env: AiEnv): boolean {
  return isAiGenerationEnabled(env) && readFlag(env, 'AI_IMAGE_PREVIEW_ENABLED', true);
}
