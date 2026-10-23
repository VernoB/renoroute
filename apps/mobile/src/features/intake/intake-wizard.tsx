import { zodResolver } from '@hookform/resolvers/zod';
import {
  formatCad,
  HEATING_SYSTEMS,
  HOME_TYPES,
  homeInputSchema,
  INCOME_BANDS,
  parseHomeInput,
  type AppLocale,
  type HomeInput,
} from '@renoroute/shared';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm, type Resolver, type UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const TOTAL_STEPS = 8;

const STEP_KEYS = [
  'intake.stepType',
  'intake.stepYear',
  'intake.stepArea',
  'intake.stepHeating',
  'intake.stepWater',
  'intake.stepBills',
  'intake.stepPeople',
  'intake.stepIncome',
] as const;

type HeatingSystem = (typeof HEATING_SYSTEMS)[number];
type IncomeBand = (typeof INCOME_BANDS)[number];

export type IntakeWizardProps = {
  initialValues?: Partial<HomeInput>;
  initialStep?: number;
  onChange: (value: HomeInput) => void;
  onComplete?: (value: HomeInput) => void;
};

export function IntakeWizard(props: IntakeWizardProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { gcTime: Infinity, retry: false },
          queries: { gcTime: Infinity, retry: false },
        },
      }),
  );
  useEffect(() => () => client.clear(), [client]);
  return (
    <QueryClientProvider client={client}>
      <IntakeWizardForm {...props} />
    </QueryClientProvider>
  );
}

function IntakeWizardForm({ initialValues, initialStep, onChange, onComplete }: IntakeWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(() => clampStep(initialStep));
  const [monthlyCost, setMonthlyCost] = useState(() =>
    monthlyFromAnnual(initialValues?.annualEnergyCostCad ?? null),
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const form = useForm<HomeInput>({
    defaultValues: emptyHome(initialValues),
    resolver: zodResolver(homeInputSchema) as Resolver<HomeInput>,
  });
  const save = useMutation({
    mutationFn: async (value: HomeInput) => {
      onChangeRef.current(value);
    },
  });

  useEffect(() => persistHome(form.getValues(), save.mutate), []);
  useEffect(() => {
    const sub = form.watch((value) => persistHome(value, save.mutate));
    return () => sub.unsubscribe();
  }, [form, save.mutate]);

  function goNext() {
    const parsed = parseDraft(form.getValues());
    if (!parsed) {
      return;
    }
    if (step >= TOTAL_STEPS) {
      onComplete?.(parsed);
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text
        accessibilityRole="header"
        className="font-display text-h1 text-neutral-900"
        testID="intake-title"
      >
        {t('intake.title')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">
        {t('intake.progress', { step, total: TOTAL_STEPS })}
      </Text>
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t(stepTitleKey(step))}
      </Text>
      <StepBody
        monthlyCost={monthlyCost}
        setMonthlyCost={setMonthlyCost}
        setValue={form.setValue}
        step={step}
        values={form.watch()}
      />
      <NavButtons
        onBack={() => setStep((current) => current - 1)}
        onNext={goNext}
        onSkip={goNext}
        step={step}
      />
    </ScrollView>
  );
}

function StepBody({
  step,
  values,
  setValue,
  monthlyCost,
  setMonthlyCost,
}: {
  step: number;
  values: HomeInput;
  setValue: UseFormSetValue<HomeInput>;
  monthlyCost: number | null;
  setMonthlyCost: (value: number | null) => void;
}) {
  if (step === 1) {
    return (
      <TypeStep onSelect={(homeType) => setValue('homeType', homeType)} value={values.homeType} />
    );
  }
  if (step === 2) {
    return (
      <YearStep
        onChange={(yearBuilt) => setValue('yearBuilt', yearBuilt)}
        value={values.yearBuilt}
      />
    );
  }
  if (step === 3) {
    return (
      <AreaStep
        onChange={(floorAreaSqft) => setValue('floorAreaSqft', floorAreaSqft)}
        value={values.floorAreaSqft}
      />
    );
  }
  if (step === 4) {
    return (
      <HeatingStep
        onPrimary={(heatingPrimary) => setValue('heatingPrimary', heatingPrimary)}
        onSecondary={(heatingSecondary) => setValue('heatingSecondary', heatingSecondary)}
        primary={values.heatingPrimary}
        secondary={values.heatingSecondary}
      />
    );
  }
  if (step === 5) {
    return (
      <WaterStep
        onChange={(waterHeater) => setValue('waterHeater', waterHeater)}
        value={values.waterHeater}
      />
    );
  }
  if (step === 6) {
    return (
      <BillsStep
        monthlyCost={monthlyCost}
        onClear={() => clearBills(setValue, setMonthlyCost)}
        onCost={(value) => {
          setMonthlyCost(value);
          setValue('annualEnergyCostCad', value == null ? null : value * 12);
        }}
        onKwh={(annualElectricityKwh) => setValue('annualElectricityKwh', annualElectricityKwh)}
        onOil={(annualOilLitres) => setValue('annualOilLitres', annualOilLitres)}
        values={values}
      />
    );
  }
  if (step === 7) {
    return (
      <PeopleStep
        occupants={values.occupants}
        onOccupants={(occupants) => setValue('occupants', occupants)}
        onOwner={(ownerOccupied) => setValue('ownerOccupied', ownerOccupied)}
        ownerOccupied={values.ownerOccupied}
      />
    );
  }
  return (
    <IncomeStep
      onSelect={(householdIncomeBand) => setValue('householdIncomeBand', householdIncomeBand)}
      value={values.householdIncomeBand}
    />
  );
}

function TypeStep({
  value,
  onSelect,
}: {
  value: HomeInput['homeType'];
  onSelect: (type: (typeof HOME_TYPES)[number]) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      {HOME_TYPES.map((type) => (
        <ChoiceButton
          key={type}
          label={t(`intake.type.${type}`)}
          onPress={() => onSelect(type)}
          selected={value === type}
        />
      ))}
    </View>
  );
}

function YearStep({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <NumberField integer label={t('intake.yearExact')} onChange={onChange} value={value} />
      <ChoiceButton
        label={t('intake.unknown')}
        onPress={() => onChange(null)}
        selected={value == null}
      />
    </View>
  );
}

function AreaStep({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <NumberField integer label={t('intake.areaSqft')} onChange={onChange} value={value} />
      <Text className="font-inter text-caption text-neutral-600">{t('intake.areaHint')}</Text>
    </View>
  );
}

function HeatingStep({
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  primary: HeatingSystem;
  secondary: HeatingSystem | null;
  onPrimary: (value: HeatingSystem) => void;
  onSecondary: (value: HeatingSystem | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-4">
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t('intake.heatingPrimary')}
      </Text>
      <HeatingList onSelect={onPrimary} value={primary} />
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t('intake.heatingSecondary')}
      </Text>
      <HeatingList
        onSelect={(system) => onSecondary(secondary === system ? null : system)}
        value={secondary}
      />
    </View>
  );
}

function HeatingList({
  value,
  onSelect,
}: {
  value: HeatingSystem | null;
  onSelect: (value: HeatingSystem) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      {HEATING_SYSTEMS.map((system) => (
        <ChoiceButton
          key={system}
          label={heatingLabel(system, t)}
          onPress={() => onSelect(system)}
          selected={value === system}
        />
      ))}
    </View>
  );
}

function WaterStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <TextInput
      accessibilityLabel={t('intake.waterHeater')}
      className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
      maxLength={60}
      onChangeText={(text) => onChange(text.trim().length > 0 ? text : null)}
      placeholder={t('intake.waterHeater')}
      value={value ?? ''}
    />
  );
}

function BillsStep({
  values,
  monthlyCost,
  onKwh,
  onCost,
  onOil,
  onClear,
}: {
  values: HomeInput;
  monthlyCost: number | null;
  onKwh: (value: number | null) => void;
  onCost: (value: number | null) => void;
  onOil: (value: number | null) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <NumberField
        integer
        label={t('intake.kwhYear')}
        onChange={onKwh}
        value={values.annualElectricityKwh}
      />
      <NumberField label={t('intake.costMonth')} onChange={onCost} value={monthlyCost} />
      <NumberField
        integer
        label={t('intake.oilLitres')}
        onChange={onOil}
        value={values.annualOilLitres}
      />
      <ChoiceButton label={t('intake.unknown')} onPress={onClear} selected={billsUnknown(values)} />
    </View>
  );
}

function PeopleStep({
  occupants,
  ownerOccupied,
  onOccupants,
  onOwner,
}: {
  occupants: number | null;
  ownerOccupied: boolean | null;
  onOccupants: (value: number | null) => void;
  onOwner: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const owner = ownerOccupied === true;
  return (
    <View className="gap-3">
      <NumberField integer label={t('intake.occupants')} onChange={onOccupants} value={occupants} />
      <Pressable
        accessibilityLabel={t('intake.ownerOccupied')}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: owner }}
        className={`min-h-12 justify-center rounded-lg border px-3 ${
          owner ? 'border-primary-700 bg-primary-50' : 'border-neutral-400 bg-surface'
        }`}
        onPress={() => onOwner(!owner)}
      >
        <Text className="font-inter text-body text-neutral-900">{t('intake.ownerOccupied')}</Text>
      </Pressable>
    </View>
  );
}

function IncomeStep({
  value,
  onSelect,
}: {
  value: IncomeBand | null;
  onSelect: (value: IncomeBand) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';
  return (
    <View className="gap-3">
      <Text className="font-inter text-caption text-neutral-600">{t('intake.incomeHint')}</Text>
      {INCOME_BANDS.map((band) => (
        <ChoiceButton
          key={band}
          label={incomeLabel(band, locale, t)}
          onPress={() => onSelect(band)}
          selected={value === band}
        />
      ))}
    </View>
  );
}

function NavButtons({
  step,
  onBack,
  onNext,
  onSkip,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      {step > 1 ? (
        <Pressable
          accessibilityLabel={t('intake.back')}
          accessibilityRole="button"
          className="min-h-12 items-center justify-center"
          onPress={onBack}
        >
          <Text className="font-inter text-body text-primary-700">{t('intake.back')}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel={t('intake.next')}
        accessibilityRole="button"
        className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
        onPress={onNext}
      >
        <Text className="font-inter-semibold text-button text-surface">{t('intake.next')}</Text>
      </Pressable>
      {step > 1 ? (
        <Pressable
          accessibilityLabel={t('intake.skip')}
          accessibilityRole="button"
          className="min-h-12 items-center justify-center"
          onPress={onSkip}
        >
          <Text className="font-inter text-body text-primary-700">{t('intake.skip')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`min-h-12 justify-center rounded-lg border px-3 ${
        selected ? 'border-primary-700 bg-primary-50' : 'border-neutral-400 bg-surface'
      }`}
      onPress={onPress}
    >
      <Text className="font-inter text-body text-neutral-900">{label}</Text>
    </Pressable>
  );
}

function NumberField({
  label,
  value,
  onChange,
  integer = false,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  integer?: boolean;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
      keyboardType="number-pad"
      onChangeText={(text) => onChange(parseNumber(text, integer))}
      placeholder={label}
      value={value == null ? '' : String(value)}
    />
  );
}

function emptyHome(initial?: Partial<HomeInput>): HomeInput {
  const parsed = homeInputSchema.safeParse({
    electricUtility: 'unknown',
    heatingPrimary: 'unknown',
    ...initial,
  });
  return parsed.success ? parsed.data : homeInputSchema.parse({ electricUtility: 'unknown' });
}

function persistHome(value: Partial<HomeInput>, save: (home: HomeInput) => void) {
  const parsed = parseDraft(value);
  if (parsed) {
    save(parsed);
  }
}

function parseDraft(value: Partial<HomeInput>): HomeInput | null {
  const parsed = parseHomeInput({ electricUtility: 'unknown', ...value });
  return parsed.ok ? parsed.value : null;
}

function clampStep(step: number | undefined): number {
  if (step == null || !Number.isInteger(step) || step < 1) {
    return 1;
  }
  return step > TOTAL_STEPS ? TOTAL_STEPS : step;
}

function stepTitleKey(step: number): (typeof STEP_KEYS)[number] {
  return STEP_KEYS[step - 1] ?? 'intake.stepType';
}

function monthlyFromAnnual(annual: number | null | undefined): number | null {
  return annual == null ? null : annual / 12;
}

function billsUnknown(values: HomeInput): boolean {
  return (
    values.annualElectricityKwh == null &&
    values.annualEnergyCostCad == null &&
    values.annualOilLitres == null
  );
}

function clearBills(
  setValue: UseFormSetValue<HomeInput>,
  setMonthlyCost: (value: number | null) => void,
) {
  setValue('annualElectricityKwh', null);
  setValue('annualEnergyCostCad', null);
  setValue('annualOilLitres', null);
  setMonthlyCost(null);
}

function parseNumber(text: string, integer: boolean): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (integer && !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

function heatingLabel(system: HeatingSystem, t: (key: string) => string): string {
  if (system === 'unknown') {
    return t('intake.unknown');
  }
  if (system === 'other') {
    return t('intake.type.other');
  }
  return t(`intake.heat.${system}`);
}

function incomeLabel(band: IncomeBand, locale: AppLocale, t: (key: string) => string): string {
  if (band === 'prefer_not_to_say') {
    return t('intake.preferNot');
  }
  if (band === 'under_70k') {
    return `${formatCad(0, locale)} – ${formatCad(70_000, locale)}`;
  }
  if (band === 'from_70k_to_100k') {
    return `${formatCad(70_000, locale)} – ${formatCad(100_000, locale)}`;
  }
  if (band === 'from_100k_to_150k') {
    return `${formatCad(100_000, locale)} – ${formatCad(150_000, locale)}`;
  }
  return formatCad(150_000, locale);
}
