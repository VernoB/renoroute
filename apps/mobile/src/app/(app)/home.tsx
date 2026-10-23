import {
  dashboardState,
  intakePercent,
  isIntakeComplete,
  nextActionKey,
  type HomeInput,
  type PlanProgress,
} from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DashboardScreen } from '@/features/dashboard/dashboard-screen';
import {
  currentUserId,
  loadFirstHome,
  loadPhotoCounts,
  loadPlanProgress,
  photoCountTotal,
} from '@/lib/homes';
import { supabase } from '@/lib/supabase';

type HomeView = {
  hasHome: boolean;
  home: HomeInput | null;
  homeLabel: string;
  photoCount: number;
  planProgress: PlanProgress;
};

const emptyView: HomeView = {
  hasHome: false,
  home: null,
  homeLabel: '',
  photoCount: 0,
  planProgress: 'none',
};

export default function HomeScreen() {
  const router = useRouter();
  const [view, setView] = useState<HomeView>(emptyView);

  useEffect(() => {
    void loadView().then(setView);
  }, []);

  const state = dashboardState({
    hasHome: view.hasHome,
    home: view.home,
    planProgress: view.planProgress,
  });
  const intakeComplete = isIntakeComplete(view.home);

  return (
    <View className="flex-1 bg-background" testID="app-home">
      <DashboardScreen
        homeLabel={view.homeLabel}
        nextKey={nextActionKey(state, { intakeComplete, photoCount: view.photoCount })}
        offline={supabase === null}
        onNext={() => router.push(nextRoute(state, intakeComplete, view.photoCount))}
        percent={intakePercent(view.home)}
        state={state}
      />
    </View>
  );
}

function nextRoute(
  state: ReturnType<typeof dashboardState>,
  intakeComplete: boolean,
  photoCount: number,
): '/(app)/intake' | '/(app)/photos' | '/(app)/review' {
  if (state === 'plan_preview' || state === 'plan_complete') {
    return '/(app)/review';
  }
  if (!intakeComplete) {
    return '/(app)/intake';
  }
  return photoCount > 0 ? '/(app)/review' : '/(app)/photos';
}

async function loadView(): Promise<HomeView> {
  const userId = await currentUserId();
  if (!userId) {
    return emptyView;
  }
  const home = await loadFirstHome(userId);
  if (!home) {
    return emptyView;
  }
  const counts = await loadPhotoCounts(home.row.id);
  return {
    hasHome: true,
    home: home.input,
    homeLabel: home.row.label,
    photoCount: photoCountTotal(counts),
    planProgress: await loadPlanProgress(home.row.id),
  };
}
