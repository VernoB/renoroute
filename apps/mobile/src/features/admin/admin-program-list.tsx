import { isVerificationStale, type AppLocale, type ProgramStatus } from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

export type AdminProgramRow = {
  id: string;
  nameFr: string;
  nameEn: string;
  status: ProgramStatus;
  lastVerifiedAt: string | null;
  isPublished: boolean;
  jurisdiction?: string | null;
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
  const [filter, setFilter] = useState<string | null>(null);
  const jurisdictions = [
    ...new Set(rows.map((row) => row.jurisdiction).filter((value): value is string => !!value)),
  ];
  const visible = filter ? rows.filter((row) => row.jurisdiction === filter) : rows;
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.programsTitle')}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="min-h-11 justify-center"
        onPress={() => {
          setFilter(null);
        }}
      >
        <Text className="font-inter text-body text-primary-700">{t('admin.filterAll')}</Text>
      </Pressable>
      {jurisdictions.map((code) => (
        <Pressable
          key={code}
          accessibilityRole="button"
          className="min-h-11 justify-center"
          onPress={() => {
            setFilter(code);
          }}
          testID={`admin-filter-${code}`}
        >
          <Text className="font-inter text-body text-neutral-900">
            {t('admin.jurisdiction', { code })}
          </Text>
        </Pressable>
      ))}
      {visible.map((row) => {
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
