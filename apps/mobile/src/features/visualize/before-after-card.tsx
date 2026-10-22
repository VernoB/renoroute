import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

export function BeforeAfterCard({
  beforeUri,
  afterUri,
  pending = false,
}: {
  beforeUri: string;
  afterUri: string | null;
  pending?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3" testID="visualize-before-after">
      <Text className="font-display text-h3 text-neutral-900">{t('visualize.title')}</Text>
      <View className="gap-2">
        <Text className="font-inter text-body text-neutral-700">{t('visualize.before')}</Text>
        <Image
          accessibilityLabel={t('visualize.beforeLabel')}
          accessibilityRole="image"
          className="h-40 w-full rounded-md bg-neutral-100"
          resizeMode="cover"
          source={{ uri: beforeUri }}
        />
      </View>
      <View className="gap-2">
        <Text className="font-inter text-body text-neutral-700">{t('visualize.after')}</Text>
        {pending ? (
          <Text className="font-inter text-body text-neutral-700">{t('visualize.loading')}</Text>
        ) : afterUri ? (
          <Image
            accessibilityLabel={t('visualize.afterLabel')}
            accessibilityRole="image"
            className="h-40 w-full rounded-md bg-neutral-100"
            resizeMode="cover"
            source={{ uri: afterUri }}
          />
        ) : (
          <Text className="font-inter text-body text-neutral-700">
            {t('visualize.unavailable')}
          </Text>
        )}
      </View>
      <Text className="font-inter text-caption text-neutral-600">{t('visualize.disclaimer')}</Text>
    </View>
  );
}
