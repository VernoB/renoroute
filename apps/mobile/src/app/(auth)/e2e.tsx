import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';

import { PhotoCaptureScreen } from '@/features/photos/photo-capture-screen';
import {
  bindWebPhotoDrop,
  pickWebPhotoFile,
  webPhotoObjectUrl,
} from '@/features/photos/web-photo-picker';
import { isE2eHarnessEnabled } from '@/lib/auth/e2e-harness';

import { ProfileScreen } from '../(onboarding)/_profile-form';

const e2eEnabled = isE2eHarnessEnabled({
  e2eFlag: process.env.EXPO_PUBLIC_E2E,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
});

/**
 * Browser-only harness for the province picker and the web photo control.
 * It does not create an account and it does not upload to Storage.
 */
export default function E2eRoute() {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (!e2eEnabled || Platform.OS !== 'web') {
      return undefined;
    }
    return bindWebPhotoDrop((file) => {
      const uri = webPhotoObjectUrl(file);
      if (uri) {
        setPreviewUri(uri);
      }
    });
  }, []);

  if (!e2eEnabled) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <ScrollView testID="e2e-harness">
      <ProfileScreen
        offline={false}
        onSave={() => {
          return Promise.resolve('ok');
        }}
      />
      <PhotoCaptureScreen
        category="window"
        onRetake={() => {
          setPreviewUri(null);
        }}
        onShutter={() => {
          void (async () => {
            const file = await pickWebPhotoFile();
            if (!file) {
              return;
            }
            const uri = webPhotoObjectUrl(file);
            if (uri) {
              setPreviewUri(uri);
            }
          })();
        }}
        onUse={() => undefined}
        previewUri={previewUri}
        queued={false}
      />
    </ScrollView>
  );
}
