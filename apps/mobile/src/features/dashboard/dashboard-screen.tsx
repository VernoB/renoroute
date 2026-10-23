import { nextActionKey, type DashboardState } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

const STATE_STATUS_KEY = {
  no_home: 'dashboard.stateNoHome',
  intake_partial: 'dashboard.stateIntakePartial',
  plan_preview: 'dashboard.statePlanPreview',
  plan_complete: 'dashboard.statePlanComplete',
} as const satisfies Record<DashboardState, string>;

export function DashboardScreen({
  state,
  homeLabel,
  percent,
  offline,
  onNext,
  nextKey,
}: {
  state: DashboardState;
  homeLabel: string;
  percent: number;
  offline: boolean;
  onNext: () => void;
  nextKey?: ReturnType<typeof nextActionKey>;
}) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <HomeCard homeLabel={homeLabel} percent={percent} />
      <NextActionCard nextKey={nextKey} offline={offline} onNext={onNext} state={state} />
      <PlanCard state={state} />
      <RebatesCard />
    </ScrollView>
  );
}

function HomeCard({ homeLabel, percent }: { homeLabel: string; percent: number }) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-lg bg-surface p-4 shadow-1">
      <Text accessibilityRole="header" className="font-display-semibold text-h2 text-neutral-900">
        {t('dashboard.homeCard')}
      </Text>
      {homeLabel ? (
        <Text className="font-inter text-body text-neutral-900">{homeLabel}</Text>
      ) : null}
      <Text className="font-inter text-body text-neutral-700">
        {t('dashboard.percentComplete', { percent })}
      </Text>
    </View>
  );
}

function NextActionCard({
  state,
  offline,
  onNext,
  nextKey,
}: {
  state: DashboardState;
  offline: boolean;
  onNext: () => void;
  nextKey?: ReturnType<typeof nextActionKey>;
}) {
  const { t } = useTranslation();
  const nextLabel = t(nextKey ?? nextActionKey(state));
  return (
    <View className="gap-3 rounded-lg bg-surface p-4 shadow-1">
      <Text className="font-display-semibold text-h2 text-neutral-900">
        {t('dashboard.nextAction')}
      </Text>
      <Pressable
        accessibilityLabel={nextLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: offline }}
        className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
        disabled={offline}
        onPress={onNext}
      >
        <Text className="font-inter-semibold text-button text-surface">{nextLabel}</Text>
      </Pressable>
    </View>
  );
}

function PlanCard({ state }: { state: DashboardState }) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-lg bg-surface p-4 shadow-1">
      <Text className="font-display-semibold text-h2 text-neutral-900">
        {t('dashboard.planCard')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t(STATE_STATUS_KEY[state])}</Text>
    </View>
  );
}

function RebatesCard() {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-lg bg-surface p-4 shadow-1">
      <Text className="font-display-semibold text-h2 text-neutral-900">
        {t('dashboard.rebatesCard')}
      </Text>
    </View>
  );
}
