import {
  accountLocaleUpdate,
  legalPageUrl,
  marketingConsentUpdate,
  withdrawAiConsent,
  type AppLocale,
} from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import {
  loadAccountSettings,
  persistAccountPatch,
  requestDataExport,
  signOutAccount,
} from '@/features/account/account-client';
import { AccountScreen } from '@/features/account/account-screen';
import { setAppLocale } from '@/lib/locale-preference';

const APP_VERSION = '0.0.0';

export default function AccountRoute() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const [marketing, setMarketing] = useState(false);
  const [aiConsented, setAiConsented] = useState(false);
  const [exportState, setExportState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');

  useEffect(() => {
    void loadAccountSettings().then((settings) => {
      setMarketing(settings.marketing);
      setAiConsented(settings.aiConsented);
    });
  }, []);

  return (
    <AccountScreen
      aiConsented={aiConsented}
      exportState={exportState}
      locale={locale}
      marketing={marketing}
      onChangeLocale={(next) => {
        void setAppLocale(next);
        void persistAccountPatch(accountLocaleUpdate(next));
      }}
      onDelete={() => {
        router.push('/(app)/account/delete');
      }}
      onExport={() => {
        setExportState('pending');
        void requestDataExport().then((payload) => {
          setExportState(payload ? 'done' : 'error');
        });
      }}
      onOpenPrivacy={() => {
        void Linking.openURL(legalPageUrl('privacy'));
      }}
      onOpenTerms={() => {
        void Linking.openURL(legalPageUrl('terms'));
      }}
      onSignOut={() => {
        void signOutAccount();
      }}
      onToggleMarketing={() => {
        const next = !marketing;
        setMarketing(next);
        void persistAccountPatch(marketingConsentUpdate(next));
      }}
      onWithdrawAi={() => {
        setAiConsented(false);
        void persistAccountPatch(withdrawAiConsent());
      }}
      version={APP_VERSION}
    />
  );
}
