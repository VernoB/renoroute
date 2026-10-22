import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background px-4 pt-6" testID="app-ready">
      <Text className="font-display text-h1 text-neutral-900">{t('auth.welcomeTitle')}</Text>
    </View>
  );
}
