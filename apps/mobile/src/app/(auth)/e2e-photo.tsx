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

const e2eEnabled = isE2eHarnessEnabled({
  e2eFlag: process.env.EXPO_PUBLIC_E2E,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
});

/**
 * Browser-only photo harness. Kept off the profile screen: photos are not
 * part of the profile form.
 */
export default function E2ePhotoRoute() {
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
    <ScrollView testID="e2e-photo-harness">
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
