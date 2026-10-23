import { type AppLocale } from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { requestAccountDelete, signOutAccount } from '@/features/account/account-client';
import { DeleteAccountScreen } from '@/features/account/delete-account-screen';

export default function DeleteAccountRoute() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<'mismatch' | 'failed' | null>(null);

  return (
    <DeleteAccountScreen
      error={error}
      locale={locale}
      onChangeTyped={(value) => {
        setError(null);
        setTyped(value);
      }}
      onConfirm={() => {
        setPending(true);
        void requestAccountDelete(typed, locale).then((result) => {
          setPending(false);
          if (result === 'ok') {
            void signOutAccount().then(() => {
              router.replace('/(auth)/welcome');
            });
            return;
          }
          setError(result);
        });
      }}
      pending={pending}
      typed={typed}
    />
  );
}
