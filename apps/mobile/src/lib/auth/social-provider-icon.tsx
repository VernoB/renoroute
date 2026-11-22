import { Image, View } from 'react-native';

import facebookMark from '../../../assets/brand/facebook-f.png';
import googleMark from '../../../assets/brand/google-g.png';
import tiktokMark from '../../../assets/brand/tiktok-icon.png';
import type { SocialProvider } from './social-sign-in';

/**
 * Local copies only. No hot-linked logos.
 * Google "G": https://www.gstatic.com/images/branding/googleg/2x/googleg_standard_color_128dp.png
 *   Guidelines: https://developers.google.com/identity/branding-guidelines
 * Facebook logo: https://www.facebook.com/images/fb_icon_325x325.png
 *   Guidelines: https://developers.facebook.com/docs/facebook-login/userexperience/
 * TikTok icon: logo pack linked from
 *   https://developers.tiktok.com/doc/getting-started-design-guidelines/
 *   (https://sf16-va.tiktokcdn.com/obj/eden-va2/uvzhqeh7nuhd/tt4d/logo-pack.zip)
 */
const marks = {
  google: googleMark,
  facebook: facebookMark,
  tiktok: tiktokMark,
};

export function SocialProviderIcon({ provider }: { provider: SocialProvider }) {
  return (
    <View
      accessibilityElementsHidden
      className="h-6 w-6 items-center justify-center"
      importantForAccessibility="no-hide-descendants"
      testID={`auth-social-icon-${provider}`}
    >
      {provider === 'apple' ? <AppleMark /> : null}
      {provider === 'google' || provider === 'facebook' || provider === 'tiktok' ? (
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={marks[provider]}
          style={{ height: 24, width: 24 }}
        />
      ) : null}
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
