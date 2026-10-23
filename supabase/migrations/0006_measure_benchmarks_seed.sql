-- CSV-only measure codes that 0001_init.sql did not name, then unpublished seed rows.
-- Inserts are copied from docs/research/benchmarks/seed_measure_benchmarks.sql.

alter type public.measure_code add value 'ground_source_heat_pump';
alter type public.measure_code add value 'electrical_panel_upgrade';
alter type public.measure_code add value 'drain_water_heat_recovery';

insert into public.measure_benchmarks (
  province, measure, cost_low_cad, cost_high_cad, cost_unit,
  savings_pct_low, savings_pct_high, assumptions, source_url, last_verified_at, is_active
) values
(
  'CA', 'mini_split_heat_pump', 3000, 7000, 'unit',
  null, null,
  $${"csv_key":"ductless_heat_pump","name_en":"Ductless mini-split heat pump (single zone)","name_fr":"Thermopompe murale sans conduits (une zone)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"The ductless HVAC system cost for a single zone runs $3,000 to $7,000 installed, covering the outdoor unit, one indoor head, refrigerant lines, and labour.","region":"Canada-wide","data_year":"2026","notes":"Guide updated 21/08/2026. Installed price incl. labour."}$$,
  'https://www.homestars.com/heating/price-guides/hvac-system-cost',
  '2026-10-23', false
),
(
  'NB', 'mini_split_heat_pump', 4000, 8500, 'unit',
  null, null,
  $${"csv_key":"ductless_heat_pump_nb","name_en":"Ductless mini-split heat pump (NB estimate)","name_fr":"Thermopompe murale sans conduits (estimation N.-B.)","source_name":"heatpumpinstallationcanada.ca (independent third-party guide, not government)","excerpt":"Single-zone ductless systems run $4,000–$8,500.","region":"NB","data_year":"2026","notes":"Third-party site; methodology not independently verified. Use as NB cross-check only."}$$,
  'https://heatpumpinstallationcanada.ca/new-brunswick/',
  '2026-10-23', false
),
(
  'CA', 'mini_split_heat_pump', 8000, 20000, 'project',
  null, null,
  $${"csv_key":"multizone_ductless_heat_pump","name_en":"Multi-zone ductless heat pump (2-4 zones)","name_fr":"Thermopompe multizone sans conduits (2 à 4 zones)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"Multi-zone ductless system: 2 to 4 zones | $8,000 to $20,000","region":"Canada-wide","data_year":"2026","notes":"Guide updated 21/08/2026."}$$,
  'https://www.homestars.com/heating/price-guides/hvac-system-cost',
  '2026-10-23', false
),
(
  'CA', 'central_heat_pump', 4500, 12000, 'project',
  null, null,
  $${"csv_key":"ducted_heat_pump","name_en":"Central ducted air-source heat pump","name_fr":"Thermopompe centrale à air avec conduits","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"Installed cost for a central ducted heat pump runs $4,500 to $12,000.","region":"Canada-wide","data_year":"2026","notes":"Assumes existing ductwork; HomeStars notes no ductwork adds $2,000 to $8,000."}$$,
  'https://www.homestars.com/heating/price-guides/hvac-system-cost',
  '2026-10-23', false
),
(
  'NB', 'central_heat_pump', 12000, 19000, 'project',
  null, null,
  $${"csv_key":"ducted_heat_pump_nb","name_en":"Central ducted air-source heat pump (NB estimate)","name_fr":"Thermopompe centrale avec conduits (estimation N.-B.)","source_name":"heatpumpinstallationcanada.ca (independent third-party guide, not government)","excerpt":"Ducted air-source heat pumps in New Brunswick typically cost $12,000–$19,000 installed.","region":"NB","data_year":"2026","notes":"Third-party site; cold-climate units tied into existing ductwork."}$$,
  'https://heatpumpinstallationcanada.ca/new-brunswick/',
  '2026-10-23', false
),
(
  'CA', 'ground_source_heat_pump', 20000, 40000, 'project',
  40, 70,
  $${"csv_key":"ground_source_heat_pump","name_en":"Ground-source (geothermal) heat pump","name_fr":"Thermopompe géothermique","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"The geothermal HVAC cost in Canada typically ranges from $20,000 to $40,000 ... geothermal systems can reduce heating and cooling operating costs by 40% to 70% compared to conventional systems.","region":"Canada-wide","data_year":"2026","notes":"Savings % is operating-COST reduction for heating/cooling, not total energy."}$$,
  'https://www.homestars.com/heating/price-guides/hvac-system-cost',
  '2026-10-23', false
),
(
  'CA', 'attic_insulation', 1500, 3000, 'project',
  null, 15,
  $${"csv_key":"attic_insulation","name_en":"Attic insulation","name_fr":"Isolation des combles","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"On average, attic insulation costs in Canada range from $1,500 to $3,000, including materials and installation. ... potentially saving up to 15% on heating costs annually.","region":"Canada-wide","data_year":"2026","notes":"Same page: installation $1.50-$2.45/sq ft; FAQ also says 'up to 20% or more' on heating and cooling (inconsistent) - 15 used. Savings = heating cost."}$$,
  'https://www.homestars.com/insulation/price-guides/attic-insulation-cost',
  '2026-10-23', false
),
(
  'CA', 'air_sealing', 350, 1500, 'project',
  null, null,
  $${"csv_key":"air_sealing","name_en":"Air sealing (with attic insulation)","name_fr":"Étanchéisation à l'air (avec isolation des combles)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"Before installing insulation, air sealing and proper ventilation may be necessary ... These services could add $350 to $1,500 to your total costs.","region":"Canada-wide","data_year":"2026","notes":"Includes ventilation; quoted as add-on to attic insulation, not whole-house air sealing."}$$,
  'https://www.homestars.com/insulation/price-guides/attic-insulation-cost',
  '2026-10-23', false
),
(
  'CA', 'windows', 300, 1000, 'window',
  null, null,
  $${"csv_key":"windows","name_en":"Window replacement (per window)","name_fr":"Remplacement de fenêtre (par fenêtre)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"The average cost to install windows in Canada runs from $300 to $1,000 per window for a standard replacement in an existing opening.","region":"Canada-wide","data_year":"2026","notes":"Basic vinyl double-pane; triple-pane adds $100-$300/window (same page). NB Power FAQ: ENERGY STAR v5 windows 5-25% more than code-minimum."}$$,
  'https://www.homestars.com/windows-doors/price-guides/cost-window-installation',
  '2026-10-23', false
),
(
  'CA', 'doors', 600, 2000, 'unit',
  null, null,
  $${"csv_key":"exterior_door","name_en":"Exterior door replacement","name_fr":"Remplacement de porte extérieure","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"Exterior door installation cost ranges from $600 to $2,000 for a standard single door.","region":"Canada-wide","data_year":"2026","notes":"Front entry door: $900 to $3,500 (same page)."}$$,
  'https://www.homestars.com/windows-doors/price-guides/door-installation-cost',
  '2026-10-23', false
),
(
  'CA', 'smart_thermostat', 200, 500, 'unit',
  10, 15,
  $${"csv_key":"smart_thermostat","name_en":"Smart thermostat (installed)","name_fr":"Thermostat intelligent (installé)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"the cost to install a smart thermostat ranges from $200 to $500, this higher initial investment is often offset by annual energy savings estimated at 10–15 per cent.","region":"Canada-wide","data_year":"2026","notes":"Savings figure is HomeStars' estimate, not a government figure."}$$,
  'https://www.homestars.com/heating/price-guides/thermostat-installation',
  '2026-10-23', false
),
(
  'CA', 'electrical_panel_upgrade', 1500, 3000, 'project',
  null, null,
  $${"csv_key":"electrical_panel_upgrade","name_en":"Electrical panel upgrade (e.g. to 200 A)","name_fr":"Mise à niveau du panneau électrique (ex. 200 A)","source_name":"HomeStars (Canadian cost guide, commercial)","excerpt":"the price to upgrade an electrical panel ranges from $1,500 to $3,000 for a basic panel replacement. For a more comprehensive service that includes meter, wiring, and panel upgrades, expect to pay between $3,000 and $5,000.","region":"Canada-wide","data_year":"2026","notes":"Basic replacement range used; full service upgrade $3,000-$5,000; underground $5,000-$7,000+."}$$,
  'https://www.homestars.com/electricity/price-guides/upgrading-an-electrical-panel-cost',
  '2026-10-23', false
),
(
  'NB', 'pre_evaluation', 99, 99, 'project',
  null, null,
  $${"csv_key":"energuide_evaluation","name_en":"EnerGuide home energy evaluation (NB Power Total Home)","name_fr":"Évaluation énergétique ÉnerGuide (Programme Total Home d'Énergie NB)","source_name":"NB Power - Total Home Energy Savings Program FAQ","excerpt":"Homeowners are responsible for paying a $99 fee +HST to the Certified Energy Advisor at the time of the initial Home Energy Evaluation. This $99 fee (plus HST) covers both the Initial and the Final Home Energy Evaluations.","region":"NB","data_year":"2026","notes":"Program fee, plus HST, covers initial + final evaluation. Canada-wide market price (HomeStars): $300-$600 per audit."}$$,
  'https://www.ecoenergienb.ca/en/for-home/total-home/frequently-asked-questions/',
  '2026-10-23', false
),
(
  'NB', 'drain_water_heat_recovery', 800, 1500, 'unit',
  null, null,
  $${"csv_key":"drain_water_heat_recovery","name_en":"Drain water heat recovery (DWHR)","name_fr":"Récupérateur de chaleur des eaux grises","source_name":"NB Power / Save Energy NB article","excerpt":"The cost of a DWHR system ranges between $800 and $1,500 including purchase and installation.","region":"NB","data_year":"2022","notes":"Article dated March 2022. Same page: up to $150/yr savings for an average NB household (dollar, not %)."}$$,
  'https://saveenergynb.ca/en/education-and-tips/energy-efficiency-articles/3-great-reasons-to-install-a-drain-water-heat-recovery-system/',
  '2026-10-23', false
),
(
  'ATL', 'solar_pv', 2600, 3400, 'kW',
  null, null,
  $${"csv_key":"solar_pv","name_en":"Rooftop solar PV (per kW)","name_fr":"Photovoltaïque solaire sur toit (par kW)","source_name":"T1 Solar (Maritime solar installer blog, commercial)","excerpt":"Installed residential solar in the Maritimes runs roughly $2.60 to $3.40 per watt before incentives.","region":"Atlantic (NS/NB/PEI)","data_year":"2026","notes":"Converted $/W to $/kW (x1000). Installer source - potential bias. NB Power solar incentive registration closed May 27, 2026."}$$,
  'https://t1solar.ca/blog/solar-panel-cost-atlantic-canada',
  '2026-10-23', false
);
