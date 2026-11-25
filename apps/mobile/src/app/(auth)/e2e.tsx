import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { isE2eHarnessEnabled } from '@/lib/auth/e2e-harness';

import { ProfileScreen } from '../(onboarding)/_profile-form';

const e2eEnabled = isE2eHarnessEnabled({
  e2eFlag: process.env.EXPO_PUBLIC_E2E,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
});

/** Browser-only harness for the province picker. Photos live on /e2e-photo. */
export default function E2eRoute() {
  if (!e2eEnabled) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View testID="e2e-harness">
      <ProfileScreen
        offline={false}
        onSave={() => {
          return Promise.resolve('ok');
        }}
      />
    </View>
  );
}
