import {
  ADVISOR_DIRECTORY_URL,
  BRAND,
  needsAdvisorStep,
  type AppLocale,
  type VisibleRebateProgram,
} from '@renoroute/shared';
import { formatShortDate } from '@renoroute/shared/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function RebateChecklistScreen({
  programs,
  onOpenProgram,
  onOpenOfficial,
}: {
  programs: readonly VisibleRebateProgram[];
  onOpenProgram: (id: string) => void;
  onOpenOfficial: (url: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const advisor = needsAdvisorStep(programs);
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-4 pb-8 pt-6"
      testID="rebate-checklist"
    >
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('rebates.title')}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">{t('rebates.warning')}</Text>
      {advisor ? (
        <View className="min-h-[44px] gap-2 rounded-lg bg-surface p-4 shadow-1">
          <Text className="font-display-semibold text-h2 text-neutral-900">
            {t('rebates.advisorTitle')}
          </Text>
          <Text className="font-inter text-body text-neutral-700">
            {t('rebates.advisorHint', { appName: BRAND.name })}
          </Text>
          <OfficialButton
            label={t('rebates.openOfficial')}
            onPress={() => onOpenOfficial(ADVISOR_DIRECTORY_URL)}
          />
        </View>
      ) : null}
      {programs.length === 0 ? (
        <Text className="font-inter text-body text-neutral-700">{t('rebates.empty')}</Text>
      ) : null}
      {programs.map((program) => (
        <Pressable
          key={program.id}
          accessibilityRole="button"
          className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1"
          onPress={() => onOpenProgram(program.id)}
          testID={`rebate-program-${program.id}`}
        >
          <Text className="font-display-semibold text-h2 text-neutral-900">
            {locale === 'en' ? program.nameEn : program.nameFr}
          </Text>
          <Text className="font-inter text-body text-neutral-700">
            {t(`rebates.status.${program.status}`)}
          </Text>
          {program.completionWindowMonths !== null ? (
            <Text className="font-inter text-caption text-neutral-700">
              {t('rebates.windowMonths', { count: program.completionWindowMonths })}
            </Text>
          ) : null}
          <Text className="font-inter text-caption text-neutral-700">
            {program.deadline
              ? t('rebates.windowDeadline', {
                  date: formatShortDate(new Date(`${program.deadline}T00:00:00.000Z`), locale),
                })
              : t('rebates.windowWaiting')}
          </Text>
          <Text className="font-inter text-caption text-neutral-700">
            {t('rebates.verifiedOn', {
              date: formatShortDate(new Date(`${program.lastVerifiedAt}T00:00:00.000Z`), locale),
            })}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function OfficialButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
      onPress={onPress}
      testID="rebate-open-official"
    >
      <Text className="font-inter-semibold text-body text-white">{label}</Text>
    </Pressable>
  );
}
