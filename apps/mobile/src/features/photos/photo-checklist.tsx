import { OPTIONAL_PHOTO_CATEGORIES, RECOMMENDED_PHOTO_CATEGORIES } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

const PHOTO_TARGET_COUNT = 2;

const CHECKLIST_CATEGORIES = [
  ...RECOMMENDED_PHOTO_CATEGORIES,
  ...OPTIONAL_PHOTO_CATEGORIES,
] as const;

type PhotoCategory = (typeof CHECKLIST_CATEGORIES)[number];

export type PhotoChecklistProps = {
  counts: Partial<Record<PhotoCategory, number>>;
  onAdd: (category: PhotoCategory) => void;
  onTakePhoto?: (category: PhotoCategory) => void;
};

export function PhotoChecklist({ counts, onAdd, onTakePhoto }: PhotoChecklistProps) {
  const { t } = useTranslation();
  const nextCategory = nextOpenCategory(counts);
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('photos.title')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t('photos.hint')}</Text>
      <View className="flex-row flex-wrap gap-3">
        {CHECKLIST_CATEGORIES.map((category) => (
          <CategoryCard
            category={category}
            count={counts[category] ?? 0}
            key={category}
            onAdd={onAdd}
          />
        ))}
      </View>
      <ActionButton label={t('photos.addGallery')} onPress={() => onAdd(nextCategory)} />
      {onTakePhoto ? (
        <ActionButton label={t('photos.takePhoto')} onPress={() => onTakePhoto(nextCategory)} />
      ) : null}
    </ScrollView>
  );
}

function CategoryCard({
  category,
  count,
  onAdd,
}: {
  category: PhotoCategory;
  count: number;
  onAdd: (category: PhotoCategory) => void;
}) {
  const { t } = useTranslation();
  const recommended = isRecommended(category);
  const badge = t(recommended ? 'photos.recommended' : 'photos.optional');
  const name = t(`photos.category.${category}`);
  return (
    <Pressable
      accessibilityLabel={`${name}, ${badge}`}
      accessibilityRole="button"
      className="min-h-12 min-w-[148px] grow basis-[46%] gap-1 rounded-lg bg-surface p-3 shadow-1"
      onPress={() => onAdd(category)}
      testID={`photo-category-${category}`}
    >
      <Text className="font-inter-semibold text-body text-neutral-900">{name}</Text>
      <Text className="font-inter text-caption text-neutral-700" testID={`photo-count-${category}`}>
        {`${count}/${PHOTO_TARGET_COUNT}`}
      </Text>
      <Text className="font-inter text-caption text-neutral-600">{badge}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
      onPress={onPress}
    >
      <Text className="font-inter-semibold text-button text-surface">{label}</Text>
    </Pressable>
  );
}

function isRecommended(category: PhotoCategory): boolean {
  return (RECOMMENDED_PHOTO_CATEGORIES as readonly string[]).includes(category);
}

function nextOpenCategory(counts: PhotoChecklistProps['counts']): PhotoCategory {
  const open = RECOMMENDED_PHOTO_CATEGORIES.find(
    (category) => (counts[category] ?? 0) < PHOTO_TARGET_COUNT,
  );
  return open ?? 'window';
}
