import { type AppLocale, type VisibleRebateProgram } from '@renoroute/shared';
import { formatShortDate } from '@renoroute/shared/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { formatCadRange } from '@/features/plan/plan-view';

export function RebateProgramScreen({
  program,
  onOpenOfficial,
}: {
  program: VisibleRebateProgram;
  onOpenOfficial: (url: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {locale === 'en' ? program.nameEn : program.nameFr}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">{t('rebates.warning')}</Text>
      <Text className="font-inter text-body text-neutral-700">{program.administrator}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {t(`rebates.status.${program.status}`)}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">
        {t('rebates.verifiedOn', {
          date: formatShortDate(new Date(`${program.lastVerifiedAt}T00:00:00.000Z`), locale),
        })}
      </Text>
      <Text className="font-display-semibold text-h2 text-neutral-900">{t('rebates.amounts')}</Text>
      {program.rules.length === 0 ? (
        <Text className="font-inter text-body text-neutral-700">{t('rebates.noAmounts')}</Text>
      ) : (
        program.rules.map((rule) => (
          <View key={rule.id} className="rounded-lg bg-surface p-4">
            <Text
              className="font-inter text-body text-neutral-900"
              testID={`rebate-measure-${rule.measure}`}
            >
              {t(`preview.measure.${rule.measure}`)}
            </Text>
            <Text className="font-inter text-caption text-neutral-700">
              {formatCadRange(rule.amountMinCad, rule.amountMaxCad, locale) ??
                t('plan.rangeUnknown')}
            </Text>
          </View>
        ))
      )}
      {program.dossierItems.length === 0 ? (
        <Text className="font-inter text-body text-neutral-700">
          {t('rebates.packEmptyDossier')}
        </Text>
      ) : (
        program.dossierItems.map((item) => (
          <Text key={item.id} className="font-inter text-body text-neutral-700">
            {t('rebates.kindLine', {
              kind: t(`rebates.kind.${item.kind}`),
              label: locale === 'en' ? item.labelEn : item.labelFr,
            })}
          </Text>
        ))
      )}
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
        onPress={() => onOpenOfficial(program.officialUrl)}
        testID="rebate-program-official"
      >
        <Text className="font-inter-semibold text-body text-white">
          {t('rebates.openOfficial')}
        </Text>
      </Pressable>
      <Text className="font-inter text-caption text-neutral-700">{t('rebates.noFiling')}</Text>
    </ScrollView>
  );
}
