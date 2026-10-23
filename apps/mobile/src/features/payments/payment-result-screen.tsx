import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

export type PaymentResultStatus = 'waiting' | 'success' | 'failed' | 'cancelled';

export function PaymentResultScreen({
  status,
  onRetry,
}: {
  status: PaymentResultStatus;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const titleKey =
    status === 'success'
      ? 'payments.success'
      : status === 'waiting'
        ? 'payments.waiting'
        : status === 'cancelled'
          ? 'payments.cancelled'
          : 'payments.failed';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t(titleKey)}
      </Text>
      {status === 'success' ? null : (
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
          onPress={onRetry}
          testID="payment-retry"
        >
          <Text className="font-inter-semibold text-body text-white">{t('payments.retry')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
