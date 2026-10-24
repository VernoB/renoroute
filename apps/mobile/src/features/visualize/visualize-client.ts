import {
  unavailableVisualization,
  visualizationResultSchema,
  type VisualizationResult,
} from '@renoroute/shared';

import { supabase } from '@/lib/supabase';

export async function requestVisualization(input: {
  locale: 'fr' | 'en';
  imageDataUrl: string;
  measureHint?: string;
}): Promise<VisualizationResult> {
  if (!supabase) {
    return unavailableVisualization('error');
  }
  try {
    const { data, error } = await supabase.functions.invoke('visualize-renovation', {
      body: input,
    });
    if (error) {
      return unavailableVisualization('error');
    }
    const parsed = visualizationResultSchema.safeParse(data);
    return parsed.success ? parsed.data : unavailableVisualization('error');
  } catch {
    return unavailableVisualization('error');
  }
}
