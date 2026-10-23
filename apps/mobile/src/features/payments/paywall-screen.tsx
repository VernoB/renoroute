import { formatCad, PLAN_PRODUCTS, type AppLocale, type PlanProductCode } from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type PayChannel = 'iap' | 'web';

export type PaywallScreenProps = {
  channel: PayChannel;
  selectedCode?: PlanProductCode;
  busy?: boolean;
  messageKey?: string | null;
  onSelect?: (code: PlanProductCode) => void;
  onPay: (code: PlanProductCode) => void;
};

export function PaywallScreen(props: PaywallScreenProps) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const [selected, setSelected] = useState<PlanProductCode>(props.selectedCode ?? 'plan_49');
  const payKey = props.channel === 'iap' ? 'payments.payIap' : 'payments.payWeb';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('payments.title')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t('payments.choose')}</Text>
      <Text className="font-inter text-body text-neutral-700">{t('payments.included')}</Text>
      {(Object.keys(PLAN_PRODUCTS) as PlanProductCode[]).map((code) => {
        const product = PLAN_PRODUCTS[code];
        const selectedCard = selected === code;
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCard }}
            className={`min-h-[44px] rounded-lg p-4 ${selectedCard ? 'bg-primary-50' : 'bg-surface'} shadow-1`}
            onPress={() => {
              setSelected(code);
              props.onSelect?.(code);
            }}
            testID={`paywall-${code}`}
          >
            <Text className="font-display-semibold text-h2 text-neutral-900">
              {t(product.titleKey)}
            </Text>
            <Text className="font-inter text-body text-neutral-900">
              {formatCad(product.amountCents / 100, locale)}
            </Text>
          </Pressable>
        );
      })}
      <Text className="font-inter text-caption text-neutral-700">{t('payments.taxesNote')}</Text>
      <Text className="font-inter text-caption text-neutral-700">{t('payments.refundNote')}</Text>
      {props.messageKey ? (
        <Text className="font-inter text-body text-neutral-700">{t(props.messageKey)}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
        disabled={props.busy}
        onPress={() => props.onPay(selected)}
        testID="paywall-pay"
      >
        <Text className="font-inter-semibold text-body text-white">{t(payKey)}</Text>
      </Pressable>
    </ScrollView>
  );
}
