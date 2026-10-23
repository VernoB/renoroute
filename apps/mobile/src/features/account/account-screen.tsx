import { SUPPORTED_LOCALES, type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function AccountScreen({
  locale,
  marketing,
  aiConsented,
  version,
  exportState,
  onChangeLocale,
  onToggleMarketing,
  onWithdrawAi,
  onExport,
  onDelete,
  onSignOut,
  onOpenPrivacy,
  onOpenTerms,
}: {
  locale: AppLocale;
  marketing: boolean;
  aiConsented: boolean;
  version: string;
  exportState: 'idle' | 'pending' | 'done' | 'error';
  onChangeLocale: (locale: AppLocale) => void;
  onToggleMarketing: () => void;
  onWithdrawAi: () => void;
  onExport: () => void;
  onDelete: () => void;
  onSignOut: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-4 pb-8 pt-6"
      testID="account-screen"
    >
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('account.title')}
      </Text>
      <Text className="font-display-semibold text-h2 text-neutral-900">
        {t('account.language')}
      </Text>
      <View className="flex-row gap-2">
        {SUPPORTED_LOCALES.map((code) => (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: locale === code }}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-lg px-4 ${
              locale === code ? 'bg-primary-700' : 'bg-surface'
            }`}
            onPress={() => onChangeLocale(code)}
            testID={`account-locale-${code}`}
          >
            <Text
              className={`font-inter-semibold text-body ${
                locale === code ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {t(`locale.${code}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text className="font-display-semibold text-h2 text-neutral-900">
        {t('account.consents')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">
        {aiConsented ? t('account.aiOn') : t('account.aiOff')}
      </Text>
      {aiConsented ? (
        <ActionButton
          label={t('account.withdrawAi')}
          onPress={onWithdrawAi}
          testID="account-withdraw-ai"
        />
      ) : null}
      <Text className="font-inter text-body text-neutral-700">
        {marketing ? t('account.marketingOn') : t('account.marketingOff')}
      </Text>
      <ActionButton
        label={t('account.toggleMarketing')}
        onPress={onToggleMarketing}
        testID="account-toggle-marketing"
      />
      <ActionButton
        label={exportState === 'pending' ? t('account.exporting') : t('account.export')}
        onPress={onExport}
        testID="account-export"
      />
      {exportState === 'done' ? (
        <Text className="font-inter text-caption text-neutral-700">{t('account.exportDone')}</Text>
      ) : null}
      {exportState === 'error' ? (
        <Text className="font-inter text-caption text-danger-700">{t('account.exportError')}</Text>
      ) : null}
      <ActionButton label={t('account.privacy')} onPress={onOpenPrivacy} testID="account-privacy" />
      <ActionButton label={t('account.terms')} onPress={onOpenTerms} testID="account-terms" />
      <Text className="font-inter text-caption text-neutral-700">
        {t('account.version', { version })}
      </Text>
      <ActionButton label={t('account.signOut')} onPress={onSignOut} testID="account-sign-out" />
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-danger-700 px-4"
        onPress={onDelete}
        testID="account-delete"
      >
        <Text className="font-inter-semibold text-body text-white">{t('account.delete')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ActionButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[44px] items-center justify-center rounded-lg bg-surface px-4"
      onPress={onPress}
      testID={testID}
    >
      <Text className="font-inter-semibold text-body text-neutral-900">{label}</Text>
    </Pressable>
  );
}
