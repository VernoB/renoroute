import { isVerificationStale, type AppLocale, type ProgramStatus } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

export type AdminProgramRow = {
  id: string;
  nameFr: string;
  nameEn: string;
  status: ProgramStatus;
  lastVerifiedAt: string;
  isPublished: boolean;
};

export function AdminProgramList({
  rows,
  onOpen,
}: {
  rows: readonly AdminProgramRow[];
  onOpen: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.programsTitle')}
      </Text>
      {rows.map((row) => {
        const stale = isVerificationStale(row.lastVerifiedAt);
        return (
          <Pressable
            key={row.id}
            accessibilityRole="button"
            className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1"
            onPress={() => onOpen(row.id)}
            testID={`admin-program-${row.id}`}
          >
            <Text className="font-display-semibold text-h2 text-neutral-900">
              {locale === 'en' ? row.nameEn : row.nameFr}
            </Text>
            <Text className="font-inter text-body text-neutral-700">
              {t(`admin.status.${row.status}`)}
            </Text>
            <Text className="font-inter text-caption text-neutral-700">
              {stale ? t('admin.stale') : t('admin.verifiedOn', { date: row.lastVerifiedAt })}
            </Text>
            <Text className="font-inter text-caption text-neutral-700">
              {row.isPublished ? t('admin.published') : t('admin.unpublished')}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
