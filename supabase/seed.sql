-- Dev seed for rebate_programs. Brown approved publish 2026-10-23 (M5-04).
-- Four programs published. Closed Greener Homes Loan stays unpublished (history).
-- Official https sources only. Do not invent amounts.

insert into public.rebate_programs (
  slug, jurisdiction, administrator, name_fr, name_en,
  summary_fr, summary_en, status,
  requires_pre_evaluation, pre_evaluation_fee_cad, pre_evaluation_fee_note,
  completion_window_months, income_max_cad,
  waitlist_note_fr, waitlist_note_en,
  applies_to_utilities, official_url, source_url, last_verified_at,
  opens_on, closes_on, is_published, internal_notes
) values
(
  'nbp-total-home-energy-savings', 'NB', 'NB Power',
  'Programme éconergétique pour les maisons',
  'Total Home Energy Savings Program',
  'Évaluation initiale 99 $ + TVH. Ne rien acheter avant. Neuf mois pour terminer les travaux. Remises après l''évaluation finale.',
  'Initial evaluation $99 + HST. Do not buy before it. Nine months to finish the work. Rebates after the final evaluation.',
  'open', true, 99.00, '+HST', 9, null,
  null, null, null,
  'https://www.saveenergynb.ca/for-home/total-home/',
  'https://www.saveenergynb.ca/for-home/total-home/',
  '2026-10-23', null, null, true,
  'Official FR name from econergienb.ca. Amounts from Save Energy NB rebate tables checked 2026-10-23. OHPA advance closed 30 Jun 2026 (not this program). Solar PV enrollment closed 27 May 2026. Published 2026-10-23 after Brown review.'
),
(
  'nbp-enhanced-energy-savings', 'NB', 'NB Power',
  'Programme éconergétique amélioré',
  'Enhanced Energy Savings Program',
  'Améliorations sans frais pour propriétaires-occupants. Revenu du ménage jusqu''à 70 000 $ (ligne 15000). Liste d''attente.',
  'No-cost upgrades for owner-occupants. Household income up to $70,000 (Line 15000). Waitlist.',
  'waitlist', true, null, null, null, 70000,
  'Complet pour 2025-2026 et au-delà. Liste d''attente pouvant aller jusqu''à deux ans. Aucun remboursement d''une thermopompe achetée en attendant.',
  'Fully subscribed for 2025/26 and beyond. Waitlist could be up to two years. The program does not reimburse a heat pump bought while waiting.',
  null,
  'https://www.saveenergynb.ca/en/for-home/enhanced-energy-savings-program/',
  'https://www.saveenergynb.ca/en/for-home/enhanced-energy-savings-program/faqs/',
  '2026-10-23', null, null, true,
  'Official FR name: Programme éconergétique amélioré. FAQ EN: income up to and including $70,000. Eligibility page EN/FR also says under $70,000. Registration message says fully subscribed for 2026–27. No cash rebate amounts published. Published 2026-10-23 after Brown review.'
),
(
  'ca-greener-homes-loan', 'CA', 'Government of Canada',
  'Prêt canadien pour des maisons plus vertes',
  'Canada Greener Homes Loan',
  'Programme fermé. Dernier jour pour présenter une demande : 1er octobre 2025. Financement entièrement engagé.',
  'Program closed. Last day to apply: 1 October 2025. Funding fully committed.',
  'closed', true, null, null, null, null,
  null, null, null,
  'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan',
  'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan',
  '2026-10-23', null, '2025-10-01', false,
  'Keep for history. Last apply day from NRCan Step 2A / process page. Approved loans still available. Stays unpublished (closed).'
),
(
  'ca-national-heat-pump-rebate', 'CA', 'Government of Canada',
  'Programme national de remise pour les thermopompes',
  'National Heat Pump Rebate',
  'Annoncé. Portail prévu au début de 2027. Installations à compter du 1er novembre 2026 peuvent compter. 2 000 $ au-dessus du revenu médian, ou jusqu''à 10 000 $ pour un revenu faible à médian. Seuils médians après impôt en N.-É. : 1 personne 38 831 $; 2 personnes 80 300 $; 3 personnes 103 071 $; 4 personnes 125 843 $; 5 et plus 131 835 $. Les paramètres peuvent encore changer.',
  'Announced. Portal expected to open in early 2027. Installs on or after 1 November 2026 may count. $2,000 above median income, or up to $10,000 for low- to median-income households. Nova Scotia after-tax median thresholds: 1 person $38,831; 2 persons $80,300; 3 persons $103,071; 4 persons $125,843; 5 or more $131,835. Parameters can still change.',
  'announced', false, null, null, null, null,
  null, null, null,
  'https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html',
  'https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html',
  '2026-11-22', null, null, true,
  'Official French name: Programme national de remise pour les thermopompes. name_fr_is_translation stays false. Applications are not open; portal expected early 2027. NS median thresholds copied from the Canada.ca supplemental page checked 2026-11-22. Stacking details were not stated. First published 2026-10-23; rechecked 2026-11-22. Status stays announced.'
),
(
  'sje-heat-pump-rental-financing', 'NB-SJ', 'Saint John Energy',
  'Location Zero30 et financement de thermopompes',
  'Zero30 heat-pump rental and financing',
  'Location de mini-thermopompes sans mise de fonds, offerte à la plupart des Néo-Brunswickois. Financement jusqu''à 10 000 $ sur sept ans si bon dossier de paiement chez Énergie Saint-Jean.',
  'No-upfront-cost mini-split rental, available to most New Brunswickers. Financing up to $10,000 over seven years if you have a good SJE payment history and credit score.',
  'open', false, null, null, null, null,
  null, null, null,
  'https://sjenergy.ca/products-and-services/heat-pump-rentals',
  'https://sjenergy.ca/products-and-services/heat-pump-rentals',
  '2026-10-23', null, null, true,
  'Official page is English only. Rental is not SJE-customers-only. Financing is for customers with a good payment history with SJE. Monthly rental rates are on sjenergy.ca/about/our-rates, not on the rental page. Published 2026-10-23 after Brown review.'
);

insert into public.rebate_rules (
  program_id, measure, amount_type, amount_min_cad, amount_max_cad,
  unit_label_fr, unit_label_en, conditions,
  eligibility_notes_fr, eligibility_notes_en,
  source_url, last_verified_at, is_active
)
select
  p.id, v.measure, v.amount_type, v.amount_min_cad, v.amount_max_cad,
  v.unit_label_fr, v.unit_label_en, v.conditions,
  v.eligibility_notes_fr, v.eligibility_notes_en,
  v.source_url, '2026-10-23', v.is_active
from public.rebate_programs p
join (
  values
    (
      'nbp-total-home-energy-savings',
      'mini_split_heat_pump'::public.measure_code,
      'fixed'::public.amount_type,
      400.00, 400.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Doit figurer sur la liste des thermopompes à air admissibles d''Énergie NB.',
      'Must be on NB Power''s qualifying air source heat pump list.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/space-heating-equipment-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'central_heat_pump'::public.measure_code,
      'fixed'::public.amount_type,
      1500.00, 1500.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Thermopompe centrale à air canalisée. Doit figurer sur la liste d''Énergie NB.',
      'Central ducted air source heat pump. Must be on NB Power''s qualifying list.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/space-heating-equipment-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'windows'::public.measure_code,
      'per_unit'::public.amount_type,
      50.00, 50.00, 'par fenêtre', 'per window',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'ENERGY STAR. Conserver les étiquettes. FAQ : ENERGY STAR version 5.',
      'ENERGY STAR. Keep the stickers. FAQ: ENERGY STAR Version 5.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/add-on-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'doors'::public.measure_code,
      'per_unit'::public.amount_type,
      50.00, 50.00, 'par porte', 'per door',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Fenêtres, portes et puits de lumière : 50 $ chacun, ENERGY STAR.',
      'Windows, doors and skylights: $50 each, ENERGY STAR.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/add-on-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'air_sealing'::public.measure_code,
      'range'::public.amount_type,
      250.00, 550.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '10 % = 250 $, 15 % = 350 $, 20 % = 450 $, 25 % = 550 $. Inadmissible si ACH ≤ 3 à l''évaluation initiale.',
      '10% = $250, 15% = $350, 20% = $450, 25% = $550. Not eligible if ACH is 3 or less at the initial evaluation.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/add-on-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'attic_insulation'::public.measure_code,
      'per_unit'::public.amount_type,
      0.40, 0.85, 'par pi²', 'per sq ft',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Grenier : R-15 minimum à ajouter, R-60 maximum après. Au moins 20 % de la surface.',
      'Attic: minimum R-15 to add, maximum post-upgrade R-60. Insulate at least 20% of the component area.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/insulation-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'wall_insulation'::public.measure_code,
      'per_unit'::public.amount_type,
      1.125, 2.25, 'par pi²', 'per sq ft',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Murs extérieurs : R-7,5 minimum à ajouter, R-30 maximum après. Au moins 20 % de la surface.',
      'Exterior/main walls: minimum R-7.5 to add, maximum post-upgrade R-30. Insulate at least 20% of the component area.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/insulation-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'basement_insulation'::public.measure_code,
      'per_unit'::public.amount_type,
      1.00, 2.00, 'par pi²', 'per sq ft',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Murs de sous-sol ou vide sanitaire seulement (R-10 à R-30). Solives de rive et dalle ont d''autres grilles. Au moins 20 % de la surface.',
      'Basement/crawlspace walls only (R-10 to R-30). Header and slab use other grids. Insulate at least 20% of the component area.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/insulation-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'heat_pump_water_heater'::public.measure_code,
      'fixed'::public.amount_type,
      550.00, 550.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'ENERGY STAR.',
      'ENERGY STAR.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/water-heating-equipment-incentives/',
      true
    ),
    (
      'nbp-total-home-energy-savings',
      'ventilation_hrv'::public.measure_code,
      'fixed'::public.amount_type,
      200.00, 200.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'ENERGY STAR.',
      'ENERGY STAR.',
      'https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/add-on-incentives/',
      true
    ),
    (
      'ca-greener-homes-loan',
      'other'::public.measure_code,
      'loan'::public.amount_type,
      5000.00, 40000.00, null, null,
      '{"requires_program_pre_evaluation": true, "owner_occupied_only": true}'::jsonb,
      'Fermé. Prêt sans intérêt sur 10 ans. Montants historiques seulement.',
      'Closed. Interest-free loan, 10-year term. Historical amounts only.',
      'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan',
      false
    ),
    (
      'ca-national-heat-pump-rebate',
      'mini_split_heat_pump'::public.measure_code,
      'range'::public.amount_type,
      2000.00, 10000.00, null, null,
      '{}'::jsonb,
      'Annoncé : 2 000 $ ou jusqu''à 10 000 $ (revenu faible ou médian). Liste de produits et seuil de revenu non publiés. Détails à compter du 1er novembre 2026.',
      'Announced: $2,000 or up to $10,000 (low- to median-income). Product list and income threshold not published. Details as of 1 November 2026.',
      'https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html',
      true
    ),
    (
      'ca-national-heat-pump-rebate',
      'central_heat_pump'::public.measure_code,
      'range'::public.amount_type,
      2000.00, 10000.00, null, null,
      '{}'::jsonb,
      'Annoncé pour les thermopompes électriques à air pour climat froid. Pas de distinction mini/centrale sur la page. Détails à compter du 1er novembre 2026.',
      'Announced for eligible electric cold-climate air-source heat pumps. Page does not split mini-split vs central. Details as of 1 November 2026.',
      'https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html',
      true
    ),
    (
      'sje-heat-pump-rental-financing',
      'mini_split_heat_pump'::public.measure_code,
      'financing'::public.amount_type,
      null, 10000.00, null, null,
      '{}'::jsonb,
      'Jusqu''à 10 000 $ sur sept ans si bon dossier de paiement et bon crédit chez Énergie Saint-Jean. Pas un montant de remise.',
      'Up to $10,000 over seven years if you have a good payment history and credit score with Saint John Energy. Not a rebate amount.',
      'https://sjenergy.ca/products-and-services/heat-pump-rentals',
      true
    )
) as v(
  slug, measure, amount_type, amount_min_cad, amount_max_cad,
  unit_label_fr, unit_label_en, conditions,
  eligibility_notes_fr, eligibility_notes_en, source_url, is_active
) on p.slug = v.slug;
