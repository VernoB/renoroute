import type { HomeInput } from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { IntakeWizard } from '@/features/intake/intake-wizard';
import { currentUserId, loadFirstHome, saveHomeDraft } from '@/lib/homes';

export default function IntakeRoute() {
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<HomeInput> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void (async () => {
      const userId = await currentUserId();
      if (!userId) {
        setInitial({});
        return;
      }
      const home = await loadFirstHome(userId);
      setInitial(home?.input ?? {});
    })();
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  if (initial === null) {
    return null;
  }

  return (
    <IntakeWizard
      initialValues={initial}
      onChange={(value) => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
          void persist(value);
        }, 400);
      }}
      onComplete={(value) => {
        void persist(value).then(() => {
          router.push('/(app)/home/preview');
        });
      }}
    />
  );
}

async function persist(value: HomeInput): Promise<void> {
  const userId = await currentUserId();
  if (!userId) {
    return;
  }
  await saveHomeDraft(userId, value);
}
