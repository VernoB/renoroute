import {
  canGeneratePlan,
  formatCad,
  isIntakeComplete,
  type AppLocale,
  type HomeInput,
} from '@renoroute/shared';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type ReviewScreenProps = {
  home: Partial<HomeInput> | null;
  photoCount: number;
  consentAiAt: string | null;
  offline: boolean;
  onGenerate: () => void;
  footer?: ReactNode;
  message?: string | null;
};

type Translate = (key: string) => string;

const STEP_KEYS = [
  'intake.stepType',
  'intake.stepYear',
  'intake.stepArea',
  'intake.stepHeating',
  'intake.stepWater',
  'intake.stepBills',
  'intake.stepPeople',
  'intake.stepIncome',
] as const;

const UTILITY_KEY = {
  nb_power: 'profile.utilityNbPower',
  saint_john_energy: 'profile.utilitySaintJohn',
  energie_edmundston: 'profile.utilityEdmundston',
  perth_andover: 'profile.utilityPerth',
  unknown: 'profile.utilityUnknown',
  other: 'intake.type.other',
} as const;

export function ReviewScreen(props: ReviewScreenProps) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const missing = !isIntakeComplete(props.home) || props.photoCount === 0;
  const consented = canGeneratePlan({ consentAiAt: props.consentAiAt });
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('review.title')}
      </Text>
      <HomeSummary home={props.home} locale={locale} />
      <ReviewNotices
        consented={consented}
        missing={missing}
        offline={props.offline}
        photoCount={props.photoCount}
      />
      {props.message ? (
        <Text className="font-inter text-body text-neutral-700">{props.message}</Text>
      ) : null}
      {props.footer}
      <GenerateButton disabled={!consented || props.offline} onGenerate={props.onGenerate} />
    </ScrollView>
  );
}

function HomeSummary({ home, locale }: { home: Partial<HomeInput> | null; locale: AppLocale }) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      {STEP_KEYS.map((titleKey) => (
        <SectionCard
          key={titleKey}
          titleKey={titleKey}
          values={sectionValues(titleKey, home, locale, t)}
        />
      ))}
    </View>
  );
}

function SectionCard({ titleKey, values }: { titleKey: string; values: string[] }) {
  const { t } = useTranslation();
  return (
    <View className="gap-1 rounded-lg bg-surface p-4 shadow-1">
      <Text className="font-display-semibold text-h2 text-neutral-900">{t(titleKey)}</Text>
      {values.map((value) => (
        <Text key={value} className="font-inter text-body text-neutral-900">
          {value}
        </Text>
      ))}
    </View>
  );
}

function ReviewNotices({
  consented,
  missing,
  offline,
  photoCount,
}: {
  consented: boolean;
  missing: boolean;
  offline: boolean;
  photoCount: number;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <Text className="font-inter text-body text-neutral-900">
        {t('review.photosCount', { count: photoCount })}
      </Text>
      {missing ? (
        <Text className="font-inter text-body text-warning-700">{t('review.missing')}</Text>
      ) : null}
      {!consented ? (
        <Text className="font-inter text-body text-danger-700">{t('review.needConsent')}</Text>
      ) : null}
      {offline ? (
        <Text className="font-inter text-body text-danger-700">{t('auth.offline')}</Text>
      ) : null}
      <Text className="font-inter text-caption text-neutral-600">{t('review.disclaimer')}</Text>
    </View>
  );
}

function GenerateButton({ disabled, onGenerate }: { disabled: boolean; onGenerate: () => void }) {
  const { t } = useTranslation();
  const label = t('review.generate');
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
      disabled={disabled}
      onPress={onGenerate}
    >
      <Text className="font-inter-semibold text-button text-surface">{label}</Text>
    </Pressable>
  );
}

function sectionValues(
  titleKey: (typeof STEP_KEYS)[number],
  home: Partial<HomeInput> | null,
  locale: AppLocale,
  t: Translate,
): string[] {
  if (titleKey === 'intake.stepType') return typeValues(home, t);
  if (titleKey === 'intake.stepYear') return yearValues(home);
  if (titleKey === 'intake.stepArea') return areaValues(home, t);
  if (titleKey === 'intake.stepHeating') return heatingValues(home, t);
  if (titleKey === 'intake.stepWater') return waterValues(home);
  if (titleKey === 'intake.stepBills') return billsValues(home, locale, t);
  if (titleKey === 'intake.stepPeople') return peopleValues(home, t);
  return incomeValues(home, locale, t);
}

function typeValues(home: Partial<HomeInput> | null, t: Translate): string[] {
  const values: string[] = [];
  if (home?.label) values.push(home.label);
  if (home?.homeType) values.push(t(`intake.type.${home.homeType}`));
  if (home?.electricUtility) values.push(t(UTILITY_KEY[home.electricUtility]));
  return values;
}

function yearValues(home: Partial<HomeInput> | null): string[] {
  return home?.yearBuilt != null ? [String(home.yearBuilt)] : [];
}

function areaValues(home: Partial<HomeInput> | null, t: Translate): string[] {
  return home?.floorAreaSqft != null ? [`${home.floorAreaSqft} ${t('intake.areaSqft')}`] : [];
}

function heatingValues(home: Partial<HomeInput> | null, t: Translate): string[] {
  const primary = home?.heatingPrimary;
  if (primary == null) return [];
  if (primary === 'unknown') return [t('intake.unknown')];
  if (primary === 'other') return [t('intake.type.other')];
  return [t('intake.heatingPrimary')];
}

function waterValues(home: Partial<HomeInput> | null): string[] {
  return home?.waterHeater ? [home.waterHeater] : [];
}

function billsValues(
  home: Partial<HomeInput> | null,
  locale: AppLocale,
  t: Translate,
): string[] {
  const values: string[] = [];
  if (home?.annualElectricityKwh != null) {
    values.push(`${home.annualElectricityKwh} ${t('intake.kwhYear')}`);
  }
  if (home?.annualEnergyCostCad != null) {
    values.push(formatCad(home.annualEnergyCostCad, locale));
  }
  if (home?.annualOilLitres != null) {
    values.push(`${home.annualOilLitres} ${t('intake.oilLitres')}`);
  }
  return values;
}

function peopleValues(home: Partial<HomeInput> | null, t: Translate): string[] {
  const values: string[] = [];
  if (home?.occupants != null) {
    values.push(`${home.occupants} ${t('intake.occupants')}`);
  }
  if (home?.ownerOccupied) {
    values.push(t('intake.ownerOccupied'));
  }
  return values;
}

function incomeValues(
  home: Partial<HomeInput> | null,
  locale: AppLocale,
  t: Translate,
): string[] {
  const band = home?.householdIncomeBand;
  if (band == null) return [];
  if (band === 'prefer_not_to_say') return [t('intake.preferNot')];
  return [formatCad(incomeFloor(band), locale)];
}

function incomeFloor(band: NonNullable<HomeInput['householdIncomeBand']>): number {
  if (band === 'under_70k') return 0;
  if (band === 'from_70k_to_100k') return 70_000;
  if (band === 'from_100k_to_150k') return 100_000;
  return 150_000;
}
