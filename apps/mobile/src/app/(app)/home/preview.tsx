import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { FreePreviewScreen } from '@/features/preview/free-preview-screen';
import { freePreviewView, type FreePreviewView } from '@/features/preview/free-preview';
import { loadActiveBenchmarks } from '@/features/preview/load-benchmarks';
import { currentUserId, loadFirstHome } from '@/lib/homes';

export default function FreePreviewRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const [view, setView] = useState<FreePreviewView | null>(null);

  useEffect(() => {
    void loadPreview().then(setView);
  }, []);

  if (!view) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t('preview.loading')} />
      </View>
    );
  }

  return (
    <FreePreviewScreen
      onContinue={() => {
        router.push('/(app)/photos');
      }}
      view={view}
    />
  );
}

async function loadPreview(): Promise<FreePreviewView> {
  const userId = await currentUserId();
  const home = userId ? await loadFirstHome(userId) : null;
  const benchmarks = await loadActiveBenchmarks();
  return freePreviewView(home?.input ?? {}, benchmarks);
}
