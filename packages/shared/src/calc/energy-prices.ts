export const ENERGY_FUELS = [
  'electricity',
  'heating_oil',
  'propane',
  'wood_pellets',
  'natural_gas',
] as const;

export type EnergyFuel = (typeof ENERGY_FUELS)[number];

/** A row from `energy_prices`. Rates stay in the database. */
export type EnergyPriceRow = {
  fuel: EnergyFuel;
  unit: string | null;
  priceCad: number | null;
  effectiveFrom: string | null;
  isPublished: boolean;
  province?: string | null;
};

export function selectEnergyPrice(
  rows: readonly EnergyPriceRow[],
  fuel: EnergyFuel,
  onDate: string,
  province?: string | null,
): EnergyPriceRow | null {
  const eligible = rows.filter((row) => {
    const provinceOk = !province || !row.province || row.province === province;
    return (
      provinceOk &&
      row.isPublished &&
      row.fuel === fuel &&
      row.priceCad !== null &&
      row.effectiveFrom !== null &&
      row.effectiveFrom <= onDate
    );
  });

  const ranked = [...eligible].sort((left, right) => {
    const leftFrom = left.effectiveFrom ?? '';
    const rightFrom = right.effectiveFrom ?? '';
    return rightFrom.localeCompare(leftFrom);
  });

  return ranked[0] ?? null;
}

/**
 * Dollars for the calculator. Cent rows keep the sourced figure in `priceCad`.
 * This divides that figure by 100 before a kWh total is computed.
 */
export function priceAsCad(row: EnergyPriceRow): number | null {
  if (row.priceCad === null) {
    return null;
  }
  const unit = (row.unit ?? '').toLowerCase();
  if (unit.includes('cent')) {
    return row.priceCad / 100;
  }
  return row.priceCad;
}
