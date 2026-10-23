import { cleanup, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import i18n from '@/lib/i18n';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';

describe('HomeScreen empty dashboard', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French title', async () => {
    await i18n.changeLanguage('fr');
    await render(<EmptyHome />);
    expect(screen.getByText('Votre maison')).toBeTruthy();
    expect(screen.getByText('0 % rempli')).toBeTruthy();
    expect(screen.getByText('Décrire la maison')).toBeTruthy();
  });

  it('shows the English title', async () => {
    await i18n.changeLanguage('en');
    await render(<EmptyHome />);
    expect(screen.getByText('Your home')).toBeTruthy();
    expect(screen.getByText('0% complete')).toBeTruthy();
    expect(screen.getByText('Describe the home')).toBeTruthy();
  });
});

function EmptyHome() {
  return (
    <View className="flex-1 bg-background" testID="app-home">
      <DashboardScreen
        homeLabel=""
        offline={false}
        onNext={() => undefined}
        percent={0}
        state="no_home"
      />
    </View>
  );
}
