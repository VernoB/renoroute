import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { GeneratingScreen } from '@/features/plan/generating-screen';
import {
  parseGeneratePlanResponse,
  stepIndexFromElapsed,
} from '@/features/plan/generating-progress';
import { supabase } from '@/lib/supabase';

export default function GeneratingRoute() {
  const router = useRouter();
  const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();
  const startedAt = useRef(Date.now());
  const [stepIndex, setStepIndex] = useState(0);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    startedAt.current = Date.now();
    setStepIndex(0);
    setErrorReason(null);
    const tick = setInterval(() => {
      setStepIndex(stepIndexFromElapsed(Date.now() - startedAt.current));
    }, 500);
    void runGenerate(assessmentId).then((result) => {
      if (result.ok) {
        router.replace({
          pathname: '/(app)/plan/[planId]/index',
          params: { planId: result.planId },
        });
        return;
      }
      setErrorReason(result.reason);
    });
    return () => {
      clearInterval(tick);
    };
  }, [assessmentId, attempt, router]);

  return (
    <GeneratingScreen
      errorReason={errorReason}
      onLeave={() => {
        router.replace('/(app)/home');
      }}
      onRetry={() => {
        setAttempt((value) => value + 1);
      }}
      stepIndex={stepIndex}
    />
  );
}

async function runGenerate(
  assessmentId: string | undefined,
): Promise<{ ok: true; planId: string } | { ok: false; reason: string }> {
  if (!assessmentId) {
    return { ok: false, reason: 'error' };
  }
  if (!supabase) {
    return { ok: false, reason: 'offline' };
  }
  const { data } = await supabase.functions.invoke('generate-plan', {
    body: { assessmentId },
  });
  return parseGeneratePlanResponse(data);
}
