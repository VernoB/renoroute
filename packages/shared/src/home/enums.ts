export const HOME_TYPES = [
  'detached',
  'semi_detached',
  'row_house',
  'mobile_home',
  'cottage',
  'duplex',
  'other',
] as const;

export const HEATING_SYSTEMS = [
  'electric_baseboard',
  'electric_furnace',
  'oil_furnace',
  'oil_boiler',
  'propane',
  'natural_gas',
  'wood_stove',
  'pellet_stove',
  'mini_split_heat_pump',
  'central_heat_pump',
  'geothermal',
  'other',
  'unknown',
] as const;

export const ELECTRIC_UTILITIES = [
  'nb_power',
  'saint_john_energy',
  'energie_edmundston',
  'perth_andover',
  'other',
  'unknown',
] as const;

export const INCOME_BANDS = [
  'under_70k',
  'from_70k_to_100k',
  'from_100k_to_150k',
  'over_150k',
  'prefer_not_to_say',
] as const;

export const PHOTO_CATEGORIES = [
  'exterior',
  'window',
  'door',
  'attic',
  'basement',
  'heating_equipment',
  'water_heater',
  'electrical_panel',
  'energy_bill',
  'room',
  'other',
] as const;

export const ASSESSMENT_STATUSES = [
  'draft',
  'submitted',
  'processing',
  'completed',
  'failed',
] as const;

export const PLAN_STATUSES = ['preview', 'unlocked', 'archived'] as const;

export const MEASURE_CODES = [
  'pre_evaluation',
  'air_sealing',
  'attic_insulation',
  'wall_insulation',
  'basement_insulation',
  'windows',
  'doors',
  'mini_split_heat_pump',
  'central_heat_pump',
  'heat_pump_water_heater',
  'smart_thermostat',
  'ventilation_hrv',
  'solar_pv',
  'other',
] as const;

export const ITEM_STATUSES = ['todo', 'in_progress', 'done', 'skipped'] as const;

export const PROGRAM_STATUSES = [
  'open',
  'waitlist',
  'full',
  'announced',
  'paused',
  'closed',
] as const;

export const AMOUNT_TYPES = [
  'fixed',
  'per_unit',
  'range',
  'percent',
  'loan',
  'financing',
  'rental',
  'fee',
] as const;

export const USER_ROLES = ['homeowner', 'contractor', 'admin'] as const;

export const APP_LOCALES = ['fr', 'en'] as const;

export const ENERGY_ADVISOR_STATUSES = [
  'none',
  'contacted',
  'pre_evaluation_booked',
  'pre_evaluation_done',
  'post_evaluation_done',
] as const;

export const ENERGY_FUELS = [
  'electricity',
  'heating_oil',
  'propane',
  'wood_pellets',
  'natural_gas',
] as const;

export const CONTRACTOR_STATUSES = ['pending', 'vetted', 'suspended'] as const;

export const LEAD_STATUSES = [
  'requested',
  'sent',
  'accepted',
  'declined',
  'won',
  'lost',
  'cancelled',
] as const;

export const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'] as const;

export const REBATE_CHECKLIST_KINDS = [
  'document',
  'invoice',
  'model_number',
  'deadline',
  'reminder',
] as const;

export type HomeType = (typeof HOME_TYPES)[number];
export type HeatingSystem = (typeof HEATING_SYSTEMS)[number];
export type ElectricUtility = (typeof ELECTRIC_UTILITIES)[number];
export type IncomeBand = (typeof INCOME_BANDS)[number];
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];
export type PlanStatus = (typeof PLAN_STATUSES)[number];
export type MeasureCode = (typeof MEASURE_CODES)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];
export type AmountType = (typeof AMOUNT_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type SharedAppLocale = (typeof APP_LOCALES)[number];
export type EnergyAdvisorStatus = (typeof ENERGY_ADVISOR_STATUSES)[number];
export type SharedEnergyFuel = (typeof ENERGY_FUELS)[number];
export type ContractorStatus = (typeof CONTRACTOR_STATUSES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type RebateChecklistKind = (typeof REBATE_CHECKLIST_KINDS)[number];
