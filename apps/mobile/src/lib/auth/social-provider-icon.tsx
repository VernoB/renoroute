import { View } from 'react-native';

import type { SocialProvider } from './social-sign-in';

export function SocialProviderIcon({ provider }: { provider: SocialProvider }) {
  return (
    <View
      accessibilityElementsHidden
      className="h-6 w-6 items-center justify-center"
      importantForAccessibility="no-hide-descendants"
      testID={`auth-social-icon-${provider}`}
    >
      {provider === 'google' ? <GoogleMark /> : null}
      {provider === 'facebook' ? <FacebookMark /> : null}
      {provider === 'tiktok' ? <TikTokMark /> : null}
      {provider === 'apple' ? <AppleMark /> : null}
    </View>
  );
}

function GoogleMark() {
  return (
    <View className="h-6 w-6 overflow-hidden rounded-full">
      <View className="absolute left-0 top-0 h-3 w-3 bg-danger-700" />
      <View className="absolute right-0 top-0 h-3 w-3 bg-accent-400" />
      <View className="absolute bottom-0 left-0 h-3 w-3 bg-info-700" />
      <View className="absolute bottom-0 right-0 h-3 w-3 bg-success-700" />
      <View className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-surface" />
    </View>
  );
}

function FacebookMark() {
  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-info-700">
      <View className="h-3.5 w-1.5 rounded-sm bg-surface" />
    </View>
  );
}

function TikTokMark() {
  return (
    <View className="h-6 w-6 items-center justify-center rounded-md bg-neutral-900">
      <View className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-info-700" />
      <View className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-danger-700" />
      <View className="h-2.5 w-2.5 rounded-full bg-surface" />
    </View>
  );
}

function AppleMark() {
  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-900">
      <View className="h-3 w-2.5 rounded-full bg-surface" />
    </View>
  );
}
