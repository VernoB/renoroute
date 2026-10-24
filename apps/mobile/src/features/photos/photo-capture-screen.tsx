import { type PhotoCategory } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

import { photoTipKey } from './photo-capture';

export function PhotoCaptureScreen({
  category,
  previewUri,
  queued,
  onShutter,
  onRetake,
  onUse,
}: {
  category: PhotoCategory;
  previewUri: string | null;
  queued: boolean;
  onShutter: () => void;
  onRetake: () => void;
  onUse: () => void;
}) {
  const { t } = useTranslation();
  const name = t(`photos.category.${category}`);
  return (
    <View className="flex-1 justify-between bg-background px-4 py-6" testID="photo-capture">
      <View className="gap-3">
        <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
          {t('photos.captureTitle', { category: name })}
        </Text>
        <Text className="font-inter text-body text-neutral-700">{t(photoTipKey(category))}</Text>
        <View
          className="h-64 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary-700 bg-primary-50"
          testID="photo-frame"
        >
          {previewUri ? (
            <Image
              accessibilityLabel={t('photos.previewLabel')}
              className="h-full w-full"
              resizeMode="cover"
              source={{ uri: previewUri }}
              testID="photo-preview"
            />
          ) : (
            <View className="h-40 w-40 rounded-lg border border-primary-700" />
          )}
        </View>
        {queued ? (
          <Text className="font-inter text-caption text-neutral-700">{t('photos.offlineQueued')}</Text>
        ) : null}
      </View>
      <View className="gap-3">
        {previewUri ? (
          <>
            <Pressable
              accessibilityLabel={t('photos.retake')}
              accessibilityRole="button"
              className="min-h-12 items-center justify-center rounded-lg border border-neutral-400 bg-surface px-4"
              onPress={onRetake}
              testID="photo-retake"
            >
              <Text className="font-inter-semibold text-button text-neutral-900">
                {t('photos.retake')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('photos.usePhoto')}
              accessibilityRole="button"
              className="min-h-14 items-center justify-center rounded-lg bg-primary-700 px-4"
              onPress={onUse}
              testID="photo-use"
            >
              <Text className="font-inter-semibold text-button text-surface">{t('photos.usePhoto')}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityLabel={t('photos.shutter')}
            accessibilityRole="button"
            className="min-h-14 items-center justify-center rounded-full bg-primary-700 px-4"
            onPress={onShutter}
            testID="photo-shutter"
          >
            <Text className="font-inter-semibold text-button text-surface">{t('photos.shutter')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
