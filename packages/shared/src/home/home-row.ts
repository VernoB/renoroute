import type { Database } from '../types/database.types.ts';
import { HOME_PROVINCES, type HomeInput } from './home-input.ts';

type HomeRow = Database['public']['Tables']['homes']['Row'];
type HomeUpdate = Database['public']['Tables']['homes']['Update'];

export function homeRowToInput(row: HomeRow): HomeInput {
  return {
    label: row.label,
    province: isProvince(row.province) ? row.province : 'NB',
    postalCodeFsa: row.postal_code_fsa,
    municipality: row.municipality,
    yearBuilt: row.year_built,
    homeType: row.home_type,
    storeys: row.storeys === null ? null : Number(row.storeys),
    floorAreaSqft: row.floor_area_sqft,
    hasBasement: row.has_basement,
    heatingPrimary: row.heating_primary,
    heatingSecondary: row.heating_secondary,
    waterHeater: row.water_heater,
    electricUtility: row.electric_utility,
    annualElectricityKwh: row.annual_electricity_kwh,
    annualEnergyCostCad: row.annual_energy_cost_cad === null ? null : Number(row.annual_energy_cost_cad),
    annualOilLitres: row.annual_oil_litres,
    occupants: row.occupants,
    householdIncomeBand: row.household_income_band,
    ownerOccupied: row.owner_occupied,
    notes: row.notes,
  };
}

export function homeInputToUpdate(value: HomeInput): HomeUpdate {
  return {
    label: value.label ?? 'Home',
    province: value.province,
    postal_code_fsa: value.postalCodeFsa,
    municipality: value.municipality,
    year_built: value.yearBuilt,
    home_type: value.homeType,
    storeys: value.storeys,
    floor_area_sqft: value.floorAreaSqft,
    has_basement: value.hasBasement,
    heating_primary: value.heatingPrimary,
    heating_secondary: value.heatingSecondary,
    water_heater: value.waterHeater,
    electric_utility: value.electricUtility,
    annual_electricity_kwh: value.annualElectricityKwh,
    annual_energy_cost_cad: value.annualEnergyCostCad,
    annual_oil_litres: value.annualOilLitres,
    occupants: value.occupants,
    household_income_band: value.householdIncomeBand,
    owner_occupied: value.ownerOccupied,
    notes: value.notes,
  };
}

/** Keep profile utility/FSA/label when the wizard never collected them. */
export function mergeHomeUpdate(existing: HomeRow, draft: HomeInput): HomeUpdate {
  const update = homeInputToUpdate(draft);
  if (draft.electricUtility === 'unknown' && existing.electric_utility !== 'unknown') {
    update.electric_utility = existing.electric_utility;
  }
  if (!draft.postalCodeFsa && existing.postal_code_fsa) {
    update.postal_code_fsa = existing.postal_code_fsa;
  }
  if (!draft.label && existing.label) {
    update.label = existing.label;
  }
  return update;
}

function isProvince(value: string): value is (typeof HOME_PROVINCES)[number] {
  return (HOME_PROVINCES as readonly string[]).includes(value);
}
