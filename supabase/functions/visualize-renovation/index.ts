import {
  parseVisualizationInput,
  shouldAttemptVisualization,
  unavailableVisualization,
  visualizationPrompt,
  type VisualizationResult,
} from '../../../packages/shared/src/ai/visualization.ts';
import { generateImage, type FetchLike } from '../_shared/ai-client.ts';
import { VISUALIZE_PROMPT_VERSION, VISUALIZE_SYSTEM_PROMPT } from '../_shared/prompts/visualize_v1.ts';

export type VisualizeDeps = {
  env: Record<string, string | undefined>;
  consentAiAt: string | null;
  fetchImpl?: FetchLike;
};

export function visualizeRenovationHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export async function visualizeRenovation(
  body: unknown,
  deps: VisualizeDeps,
): Promise<VisualizationResult> {
  if (!shouldAttemptVisualization({ env: deps.env, consentAiAt: deps.consentAiAt })) {
    return unavailableVisualization(deps.consentAiAt ? 'disabled' : 'no_consent');
  }
  const parsed = parseVisualizationInput(body);
  if (!parsed.ok) {
    return unavailableVisualization('invalid_image');
  }

  const image = await generateImage({
    task: 'image_preview',
    env: deps.env,
    fetchImpl: deps.fetchImpl,
    messages: [
      { role: 'system', content: VISUALIZE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: `${visualizationPrompt(parsed.value)} [${VISUALIZE_PROMPT_VERSION}]` },
          { type: 'image_url', image_url: { url: parsed.value.imageDataUrl } },
        ],
      },
    ],
  });

  if (!image.ok) {
    return unavailableVisualization(
      image.reason === 'model_unavailable' || image.reason === 'disabled'
        ? image.reason
        : 'error',
    );
  }
  return {
    schema_version: 1,
    available: true,
    afterImageDataUrl: image.imageDataUrl,
    model: image.model,
    costUsd: image.costUsd,
    reason: 'ok',
  };
}

export function visualizeRenovationResponse(result: VisualizationResult): Response {
  return Response.json(result, { headers: visualizeRenovationHeaders() });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return visualizeRenovationResponse(unavailableVisualization('invalid_image'));
    }
    // JWT + profiles.consent_ai_at are attached when photo upload (M2-04) lands.
    const result = await visualizeRenovation(body, {
      env: Deno.env.toObject(),
      consentAiAt: null,
    });
    return visualizeRenovationResponse(result);
  });
}
