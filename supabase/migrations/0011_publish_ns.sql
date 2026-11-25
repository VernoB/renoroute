-- Publish Nova Scotia after Brown's review of
-- docs/research/ns-rebates-research-2026-11-22.md (checked 2026-11-22).
-- Open programs are published. Closed and paused programs stay unpublished.
-- Figures are copied from that file. Stored electricity rates stay in cents/kWh
-- (18.324 now, 19.067 from 2027-01-01). The calculator converts cents when it
-- multiplies. Customer charges ($20.08 now, $21.04 from 2027-01-01) are not
-- stored: energy_prices has no monthly-fee column.
-- ENS and Halifax have no official French page. name_fr_is_translation is true
-- there. Official French names stay false.
-- The National Heat Pump Rebate stays announced (applications early 2027).

begin;

alter table public.rebate_programs
  add column if not exists name_fr_is_translation boolean not null default false;

-- Existing seeded row, when this migration runs after seed. A fresh reset
-- inserts the same announced copy from seed.sql after migrations.
update public.rebate_programs
set
  name_fr_is_translation = false,
  last_verified_at = '2026-11-22',
  summary_fr = 'Annoncé. Portail prévu au début de 2027. Installations à compter du 1er novembre 2026 peuvent compter. 2 000 $ au-dessus du revenu médian, ou jusqu''à 10 000 $ pour un revenu faible à médian. Seuils médians après impôt en N.-É. : 1 personne 38 831 $; 2 personnes 80 300 $; 3 personnes 103 071 $; 4 personnes 125 843 $; 5 et plus 131 835 $. Les paramètres peuvent encore changer.',
  summary_en = 'Announced. Portal expected to open in early 2027. Installs on or after 1 November 2026 may count. $2,000 above median income, or up to $10,000 for low- to median-income households. Nova Scotia after-tax median thresholds: 1 person $38,831; 2 persons $80,300; 3 persons $103,071; 4 persons $125,843; 5 or more $131,835. Parameters can still change.',
  internal_notes = 'Official French name: Programme national de remise pour les thermopompes. name_fr_is_translation stays false. Status stays announced. Portal expected early 2027. NS thresholds from the Canada.ca supplemental page checked 2026-11-22. Stacking was not stated. First published 2026-10-23.'
where slug = 'ca-national-heat-pump-rebate'
  and status = 'announced';

update public.rebate_programs
set
  name_fr = 'Remises pour systèmes de chauffage résidentiel',
  name_en = 'Home Heating System Rebates',
  name_fr_is_translation = true,
  summary_fr = 'Fermé le 31 décembre 2025. Plus aucune demande. La page renvoie vers l''évaluation énergétique et la remise pour revenu modéré.',
  summary_en = 'Closed on 31 December 2025. No longer accepting applications. The page points to the Home Energy Assessment and the Moderate Income Rebate.',
  status = 'closed',
  closes_on = '2025-12-31',
  last_verified_at = '2026-11-22',
  is_published = false,
  administrator = 'Efficiency Nova Scotia',
  official_url = 'https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates',
  source_url = 'https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates',
  internal_notes = 'Closed. Not published. French name is a RenoRoute translation: no official ENS French page. Checked 2026-11-22.'
where slug = 'ns-home-heating-system-rebates';

update public.rebate_programs
set
  name_fr = 'Outil pour trouver des programmes et des remises',
  name_en = 'Find Home Energy Rebates and Programs',
  name_fr_is_translation = true,
  summary_fr = 'Questionnaire d''orientation seulement. Aucun montant. Ce n''est pas un programme.',
  summary_en = 'A quiz only. No amounts. Not a program.',
  status = 'draft',
  is_published = false,
  last_verified_at = null,
  internal_notes = 'Index page, not a rebate. Stays unpublished. French name is a translation. Checked 2026-11-22.'
where slug = 'ns-program-rebate-finder';

insert into public.rebate_programs (
  slug, jurisdiction, administrator, name_fr, name_en, name_fr_is_translation,
  summary_fr, summary_en, status,
  requires_pre_evaluation, pre_evaluation_fee_cad, pre_evaluation_fee_note,
  completion_window_months, official_url, source_url, last_verified_at,
  opens_on, closes_on, is_published, internal_notes
) values
(
  'ns-ens-home-energy-assessment', 'NS', 'Efficiency Nova Scotia',
  'Évaluation énergétique de la maison', 'Home Energy Assessment', true,
  'Frais d''évaluation de 199 $, annulés si le seuil de revenu est atteint (montant du seuil non indiqué sur la page). Remises jusqu''à 5 000 $. Travaux dans les 12 mois. Évaluation préalable requise.',
  'Assessment fee $199, waived when the income threshold is met (that threshold is not stated on the page). Rebates of up to $5,000. Upgrades within 12 months. Pre-assessment required.',
  'open', true, 199.00, 'Waived when the income threshold is met. Threshold amount not stated on the HEA page. Free for MIR participants.',
  12,
  'https://www.efficiencyns.ca/programs-rebates/home-energy-assessments',
  'https://www.efficiencyns.ca/programs-rebates/home-energy-assessments',
  '2026-11-22', null, null, true,
  'Open. French name is a translation. Per-measure amounts are from the Home Energy Assessment Rebate Guide, August 2026. Checked 2026-11-22.'
),
(
  'ns-moderate-income-rebate', 'NS', 'Efficiency Nova Scotia',
  'Remise pour revenu modéré', 'Moderate Income Rebate (MIR)', true,
  'Complément provincial réduit de 10 000 $ à un maximum de 5 000 $. Cumulable avec l''évaluation (5 000 $), pour un total d''au plus 10 000 $. Maison chauffée surtout sans électricité. Préapprobation requise. Revenu après impôt : 1 personne 37 260 $; 2 personnes 77 050 $; 3 personnes 98 900 $; 4 personnes 120 750 $; 5 et plus 126 500 $.',
  'Provincial top-up reduced from a maximum of $10,000 to $5,000. Stacks with the Home Energy Assessment ($5,000), for a total maximum of up to $10,000. Home primarily heated with non-electric sources. Pre-approval required. After-tax income: 1 person $37,260; 2 people $77,050; 3 people $98,900; 4 people $120,750; 5 or more $126,500.',
  'open', true, null, 'Free Home Energy Assessment for MIR participants.',
  12,
  'https://www.efficiencyns.ca/programs-rebates/moderate-income-rebate',
  'https://www.efficiencyns.ca/programs-rebates/moderate-income-rebate',
  '2026-11-22', null, null, true,
  'Open. Delivered by Efficiency Nova Scotia for the Province of Nova Scotia. French name is a translation. Income table has more than one cap, so income_max_cad stays empty. Checked 2026-11-22.'
),
(
  'ns-homewarming', 'NS', 'Efficiency Nova Scotia',
  'HomeWarming', 'HomeWarming', true,
  'Évaluation et travaux gratuits pour les propriétaires à faible revenu. Aucun plafond en dollars indiqué. Depuis la fermeture du programme mazout vers thermopompe : enveloppe du bâtiment et, s''il y a lieu, une thermopompe une zone (pas une thermopompe pour toute la maison). Revenu après impôt : 1 personne 30 187 $; 2 à 4 personnes 57 075 $; 5 et plus 79 163 $.',
  'Free assessment and upgrades for lower-income homeowners. No dollar cap stated. Since the oil-to-heat-pump program closed: building envelope and, where applicable, a single-zone heat pump (not a whole-home heat pump). After-tax income: 1 person $30,187; 2 to 4 people $57,075; 5 or more $79,163.',
  'open', true, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/homewarming',
  'https://www.efficiencyns.ca/programs-rebates/homewarming',
  '2026-11-22', null, null, true,
  'Open. No dollar amount stated, so no rebate_rules. French program name kept: no official French page. Checked 2026-11-22.'
),
(
  'ns-ens-free-product-installation', 'NS', 'Efficiency Nova Scotia',
  'Installation gratuite de produits', 'Free Product Installation', true,
  'Thermostat intelligent gratuit, d''une valeur allant jusqu''à 160 $, installé sans frais pour une maison chauffée à l''électricité. Ce n''est pas une remise en argent de 160 $.',
  'Free smart thermostat, valued at up to $160, professionally installed at no cost for an electrically heated home. This is not a $160 cash rebate.',
  'open', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/free-product-installation',
  'https://www.efficiencyns.ca/programs-rebates/free-product-installation',
  '2026-11-22', null, null, true,
  'Open. Value up to $160 is the product value stated on the page, not a cash rebate, so no rebate_rules. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-ens-instant-rebates', 'NS', 'Efficiency Nova Scotia',
  'Remises instantanées', 'Instant Rebates', true,
  'Remises en magasin : thermostat pour chauffage électrique 45 $; chauffe-eau thermopompe ENERGY STAR 800 $; pompe de piscine à vitesse variable 200 $; sécheuse thermopompe ENERGY STAR 150 $; corde à linge extérieure 5 $.',
  'Checkout rebates: smart thermostat for electric heating $45; ENERGY STAR heat pump water heater $800; variable-speed pool pump $200; ENERGY STAR heat pump clothes dryer $150; outside clothesline kit $5.',
  'open', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/instant-rebates',
  'https://www.efficiencyns.ca/programs-rebates/instant-rebates',
  '2026-11-22', null, null, true,
  'Open. Pool pump, dryer, and clothesline have no measure_code, so those amounts stay in the summary only. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-african-nova-scotian-communities-retrofit', 'NS', 'Efficiency Nova Scotia',
  'Programme de rénovation pour les communautés afro-néo-écossaises',
  'African Nova Scotian Communities Retrofit Program', true,
  'Aucun montant indiqué. Au-dessus du revenu modéré : évaluation, recommandations et installation de produits. Revenu faible à modéré : soutien supplémentaire. Communautés listées sur la page officielle.',
  'No dollar amount stated. Above moderate income: free assessment, recommendations, and product installations. Low-to-moderate income: additional support. Eligible communities are listed on the official page.',
  'open', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/african-nova-scotian-communities-retrofit-program',
  'https://www.efficiencyns.ca/programs-rebates/african-nova-scotian-communities-retrofit-program',
  '2026-11-22', null, null, true,
  'Open. No closing date and no dollar amount stated. No rebate_rules. French name is a translation. Checked 2026-11-22.'
),
(
  'hfx-solar-city', 'NS', 'Halifax Regional Municipality',
  'Solar City', 'Solar City', true,
  'Financement municipal, pas une remise. Charge locale volontaire remboursée sur 10 ans à un taux fixe de 4,75 %. Remboursement anticipé sans pénalité. Montant maximum non indiqué.',
  'Municipal financing, not a rebate. Voluntary local improvement charge repaid over 10 years at a fixed 4.75%. Prepay without penalty. Maximum amount not stated.',
  'open', false, null, null, null,
  'https://www.halifax.ca/home-property/solar-projects/about-solar-city',
  'https://www.halifax.ca/home-property/solar-projects/about-solar-city',
  '2026-11-22', null, null, true,
  'Open. Financing rate 4.75% over 10 years as stated. No dollar cap stated, so no rebate_rules. French name is a translation: no official Halifax French page. Checked 2026-11-22.'
),
(
  'hfx-halifact-home-energy-upgrade', 'NS', 'Halifax Regional Municipality',
  'Amélioration énergétique résidentielle HalifACT',
  'HalifACT Home Energy Upgrade (HHEU)', true,
  'Financement pour thermopompes, isolation et chauffe-eau électriques à 4,75 % sur 10 ans, par charge locale. Maison dans la MRH construite avant 2000. Montant maximum non indiqué. Le solaire n''est pas inclus.',
  'Financing for heat pumps, insulation, and electric water heaters at 4.75% over 10 years, through a local improvement charge. Home in HRM built before 2000. Maximum amount not stated. Solar is not included.',
  'open', false, null, null, null,
  'https://www.halifax.ca/about-halifax/environment-climate-change/halifact-energy-upgrade',
  'https://www.halifax.ca/about-halifax/environment-climate-change/halifact-energy-upgrade',
  '2026-11-22', null, null, true,
  'Open. Registration was open on the page checked 2026-11-22. No dollar cap stated, so no rebate_rules. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-heating-assistance-rebate', 'NS', 'Province of Nova Scotia',
  'Programme d''aide au chauffage', 'Heating Assistance Rebate Program (HARP)', false,
  '400 $ par ménage pour payer le chauffage, pas pour des travaux. Demande du 1er octobre 2026 au 31 mars 2027. Revenu net 2025 d''au plus 30 000 $ seul, ou 45 000 $ avec d''autres personnes, ou prestation d''aide au revenu, SV ou Allocation.',
  '$400 for each household to help pay for heat, not for upgrades. Apply from 1 October 2026 to 31 March 2027. 2025 net income at most $30,000 living alone, or $45,000 with others, or Income Assistance, GIS, or the Allowance.',
  'open', false, null, null, null,
  'https://www.novascotia.ca/apply-heating-assistance-rebate-heating-assistance-rebate-program',
  'https://www.novascotia.ca/apply-heating-assistance-rebate-heating-assistance-rebate-program',
  '2026-11-22', '2026-10-01', '2027-03-31', true,
  'Open. Official French name from the novascotia.ca application form. Bill help, not an upgrade, so no renovation rebate_rules. Checked 2026-11-22.'
),
(
  'ns-ens-energyforward-new-homes', 'NS', 'Efficiency Nova Scotia',
  'Maisons neuves EnergyForward', 'EnergyForward New Homes', true,
  'Jusqu''à 25 000 $ d''incitatifs pour la construction neuve seulement (15 000 $, 20 000 $ ou 25 000 $ selon la cible de coût énergétique annuel). Hors chantier de rénovation. Maisons chauffées au mazout inadmissibles.',
  'Up to $25,000 in incentives for new construction only ($15,000, $20,000, or $25,000 for the $1,000, $500, or $0 yearly energy-cost targets). Out of scope for renovations. Oil-heated homes are ineligible.',
  'open', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/energyforward-new-homes',
  'https://www.efficiencyns.ca/programs-rebates/energyforward-new-homes',
  '2026-11-22', null, null, false,
  'Open on the ENS page, but new construction only. Not published for renovation plans. No rebate_rules. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-oil-to-heat-pump-affordability', 'NS', 'Efficiency Nova Scotia',
  'Programme pour la conversion abordable du mazout à la thermopompe',
  'Oil to Heat Pump Affordability (OHPA) – Nova Scotia', false,
  'Fermé aux nouvelles demandes le 2 juillet 2026. La même page affiche aussi une bannière sur des places supplémentaires avec le réseau de partenaires. Afficher comme fermé et inviter à appeler Efficiency Nova Scotia. La page ENS n''indique pas de montant.',
  'Closed to new applicants on 2 July 2026. The same page also shows a banner about additional spots with the partner network. Show as closed and say to contact Efficiency Nova Scotia. The ENS page states no amount.',
  'closed', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/oil-to-heat-pump-affordability-program',
  'https://www.efficiencyns.ca/programs-rebates/oil-to-heat-pump-affordability-program',
  '2026-11-22', null, '2026-07-02', false,
  'Closed. Not published. French name is the federal name from the research file. ENS page states no amount, so the federal "up to $25,000" is not stored as an NS figure. Page conflict noted. Checked 2026-11-22.'
),
(
  'ns-ens-eco-shift', 'NS', 'Efficiency Nova Scotia',
  'Eco Shift', 'Eco Shift', true,
  'En pause pour les nouvelles inscriptions depuis le 9 avril 2026. Les participants actuels gardent les montants indiqués sur la page (thermostat 30 $ et tirages; contrôleur d''eau chaude 20 $).',
  'Paused to new enrollments as of 9 April 2026. Existing participants keep the amounts stated on the page (thermostat $30 and draws; hot water controller $20).',
  'paused', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/eco-shift',
  'https://www.efficiencyns.ca/programs-rebates/eco-shift',
  '2026-11-22', null, null, false,
  'Paused. Not published. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-ens-mheep', 'NS', 'Efficiency Nova Scotia',
  'Projet d''efficacité énergétique des maisons mi''kmaq',
  'Mi''kmaw Home Energy Efficiency Project (MHEEP)', true,
  'Fermé aux demandes le 15 juin 2026. Évaluation et travaux sans frais pour le participant ou la communauté. Projet à terminer le 31 mars 2027.',
  'Closed to applications on 15 June 2026. Assessment and upgrades at no cost to the participant or community. Project to be complete by 31 March 2027.',
  'closed', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/mikmaw-home-energy-efficiency-project',
  'https://www.efficiencyns.ca/programs-rebates/mikmaw-home-energy-efficiency-project',
  '2026-11-22', null, '2026-06-15', false,
  'Closed. Not published. No dollar cap stated. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-ens-solarhomes', 'NS', 'Efficiency Nova Scotia',
  'SolarHomes', 'SolarHomes', true,
  'Fermé aux propriétaires. Arrêté le 17 avril 2025. Les projets approuvés devaient être terminés le 31 mars 2026. Aucun montant pour les propriétaires.',
  'Closed to homeowners. Stopped 17 April 2025. Approved projects had to be done by 31 March 2026. No homeowner amount.',
  'closed', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/solarhomes',
  'https://www.efficiencyns.ca/programs-rebates/solarhomes',
  '2026-11-22', null, '2025-04-17', false,
  'Closed to homeowners. Not published. The non-profit pilot amount is not stored as a homeowner rebate. French name is a translation. Checked 2026-11-22.'
),
(
  'ns-ens-appliance-retirement', 'NS', 'Efficiency Nova Scotia',
  'Programme de mise à la retraite des réfrigérateurs et congélateurs',
  'Appliance Retirement Program (Fridge & Freezer Recycling)', true,
  'Fermé le 8 janvier 2025. Aucun montant.',
  'Closed on 8 January 2025. No amount.',
  'closed', false, null, null, null,
  'https://www.efficiencyns.ca/programs-rebates/fridge-and-freezer-recycling',
  'https://www.efficiencyns.ca/programs-rebates/fridge-and-freezer-recycling',
  '2026-11-22', null, '2025-01-08', false,
  'Closed. Not published. French name is a translation. Checked 2026-11-22.'
),
(
  'ca-greener-homes-grant', 'CA', 'Natural Resources Canada',
  'Subvention canadienne pour des maisons plus vertes',
  'Canada Greener Homes Grant', false,
  'Fermé. Le 31 décembre 2025 était le dernier jour pour soumettre les documents.',
  'Closed. 31 December 2025 was the last day to submit documents.',
  'closed', false, null, null, null,
  'https://www.canada.ca/en/environment-climate-change/services/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative.html',
  'https://www.canada.ca/en/environment-climate-change/services/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative.html',
  '2026-11-22', null, '2025-12-31', false,
  'Closed. Not published. Official French name. Distinct from the Greener Homes Loan already in seed. Checked 2026-11-22.'
),
(
  'ns-clean-energy-financing', 'NS', 'Clean Foundation',
  'Financement pour l''énergie propre', 'Clean Energy Financing', true,
  'Fermé. Le programme n''accepte plus de demandes.',
  'Closed. The program has ended and is no longer accepting applications.',
  'closed', false, null, null, null,
  'https://cleanenergyfinancing.ca/',
  'https://cleanenergyfinancing.ca/',
  '2026-11-22', null, null, false,
  'Closed. Not published. Program site is not a government domain; it is the URL in the research file. No amount stated. French name is a translation. Checked 2026-11-22.'
)
on conflict (slug) do nothing;

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
  v.source_url, '2026-11-22', true
from public.rebate_programs p
join (
  values
    (
      'ns-ens-home-energy-assessment',
      'mini_split_heat_pump'::public.measure_code,
      'per_unit'::public.amount_type,
      300.00, 300.00, 'par tonne', 'per ton',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '300 $ par tonne de capacité ajoutée. Liste ENS. Installateur RACM.',
      '$300 per ton of newly added capacity. ENS list. RACM installer.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'central_heat_pump'::public.measure_code,
      'per_unit'::public.amount_type,
      500.00, 500.00, 'par tonne', 'per ton',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '500 $ par tonne. Liste ENS. Installateur RACM.',
      '$500 per ton. ENS list. RACM installer.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'ground_source_heat_pump'::public.measure_code,
      'per_unit'::public.amount_type,
      600.00, 600.00, 'par tonne', 'per ton',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '600 $ par tonne. Boucle fermée ou ouverte. Seuils de COP. Au plus 40 kW / 135 kBtu/h. RACM.',
      '$600 per ton. Closed or open loop. COP thresholds. At most 40 kW / 135k Btu/h. RACM.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'heat_pump_water_heater'::public.measure_code,
      'fixed'::public.amount_type,
      800.00, 800.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '800 $. ENERGY STAR. Pas si une remise instantanée a déjà été reçue.',
      '$800. ENERGY STAR. Not if an instant rebate was already received.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'ventilation_hrv'::public.measure_code,
      'fixed'::public.amount_type,
      300.00, 300.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '300 $ pour un appareil HVI neuf.',
      '$300 for a new HVI-certified unit.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'air_sealing'::public.measure_code,
      'fixed'::public.amount_type,
      200.00, 200.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '200 $ si la cible du rapport de rénovation est atteinte.',
      '$200 when the upgrade report target is reached.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'windows'::public.measure_code,
      'per_unit'::public.amount_type,
      30.00, 30.00, 'par ouverture brute', 'per rough opening',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '30 $ par ouverture brute. ENERGY STAR coté au Canada, cadre compris.',
      '$30 per rough opening. ENERGY STAR rated in Canada, including the frame.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'doors'::public.measure_code,
      'per_unit'::public.amount_type,
      30.00, 30.00, 'par ouverture brute', 'per rough opening',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      '30 $ par ouverture brute. Même ligne du guide que les fenêtres.',
      '$30 per rough opening. Same guide line as windows.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'attic_insulation'::public.measure_code,
      'range'::public.amount_type,
      25.00, 750.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Grenier jusqu''à R-50, au moins 20 % de la surface. Départ R-12 ou moins : 150 $ à 750 $. R-13 à R-25 : 75 $ à 375 $. R-26 à R-35 : 25 $ à 125 $. Toit plat ou cathédrale : autres fourchettes du même guide (100 $ à 750 $).',
      'Attic to R-50, at least 20% of the area. Starting R-12 or less: $150 to $750. R-13 to R-25: $75 to $375. R-26 to R-35: $25 to $125. Flat roof or cathedral ceiling uses other bands in the same guide ($100 to $750).',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'wall_insulation'::public.measure_code,
      'range'::public.amount_type,
      180.00, 1500.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Murs extérieurs, au moins 20 % de la surface. Ajouter R-3,8 à R-7,4 : 180 $ à 900 $. Ajouter R-7,5 ou plus : 300 $ à 1 500 $.',
      'Exterior walls, at least 20% of the area. Add R-3.8 to R-7.4: $180 to $900. Add R-7.5 or more: $300 to $1,500.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-home-energy-assessment',
      'basement_insulation'::public.measure_code,
      'range'::public.amount_type,
      120.00, 1200.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Murs de sous-sol, au moins 20 % de la surface. Ajouter R-10 à R-22 : 120 $ à 600 $. Ajouter R-22 ou plus : 240 $ à 1 200 $. Solive de rive, vide sanitaire et dalle ont d''autres montants dans le même guide.',
      'Basement walls, at least 20% of the area. Add R-10 to R-22: $120 to $600. Add R-22 or more: $240 to $1,200. Header, crawlspace, and slab use other amounts in the same guide.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-moderate-income-rebate',
      'wall_insulation'::public.measure_code,
      'range'::public.amount_type,
      120.00, 1000.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Complément MIR seulement, après préapprobation. Murs : R-3,8 à R-7,4 = 120 $ à 600 $; R-7,5 ou plus = 200 $ à 1 000 $. Maximum du programme 5 000 $.',
      'MIR top-up only, after pre-approval. Walls: R-3.8 to R-7.4 = $120 to $600; R-7.5 or more = $200 to $1,000. Program maximum $5,000.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-moderate-income-rebate',
      'basement_insulation'::public.measure_code,
      'range'::public.amount_type,
      75.00, 750.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Complément MIR. Murs de sous-sol : R-10 à R-22 = 75 $ à 375 $; R-22 ou plus = 150 $ à 750 $. Vide sanitaire et plancher ont d''autres montants dans le guide.',
      'MIR top-up. Basement walls: R-10 to R-22 = $75 to $375; R-22 or more = $150 to $750. Crawlspace and the floor above it use other amounts in the guide.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-moderate-income-rebate',
      'mini_split_heat_pump'::public.measure_code,
      'per_unit'::public.amount_type,
      500.00, 500.00, 'par tonne', 'per ton',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Complément MIR : 500 $ par tonne. Liste ENS. RACM.',
      'MIR top-up: $500 per ton. ENS list. RACM.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-moderate-income-rebate',
      'central_heat_pump'::public.measure_code,
      'per_unit'::public.amount_type,
      1500.00, 1500.00, 'par tonne', 'per ton',
      '{"requires_program_pre_evaluation": true}'::jsonb,
      'Complément MIR : 1 500 $ par tonne. Liste ENS. RACM.',
      'MIR top-up: $1,500 per ton. ENS list. RACM.',
      'https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf'
    ),
    (
      'ns-ens-instant-rebates',
      'smart_thermostat'::public.measure_code,
      'fixed'::public.amount_type,
      45.00, 45.00, null, null,
      '{}'::jsonb,
      '45 $ à la caisse, pour le chauffage électrique, chez un détaillant participant.',
      '$45 at checkout, for electric heating, at a participating retailer.',
      'https://www.efficiencyns.ca/programs-rebates/instant-rebates'
    ),
    (
      'ns-ens-instant-rebates',
      'heat_pump_water_heater'::public.measure_code,
      'fixed'::public.amount_type,
      800.00, 800.00, null, null,
      '{}'::jsonb,
      '800 $ à la caisse. ENERGY STAR. Le guide d''évaluation dit de ne pas cumuler avec la remise HEA.',
      '$800 at checkout. ENERGY STAR. The assessment guide says not to stack this with the HEA rebate.',
      'https://www.efficiencyns.ca/programs-rebates/instant-rebates'
    )
) as v(
  slug, measure, amount_type, amount_min_cad, amount_max_cad,
  unit_label_fr, unit_label_en, conditions,
  eligibility_notes_fr, eligibility_notes_en, source_url
) on p.slug = v.slug
where not exists (
  select 1
  from public.rebate_rules existing
  where existing.program_id = p.id
    and existing.measure = v.measure
    and existing.source_url = v.source_url
);

-- Publish the two sourced Nova Scotia Power rows. Do not rewrite price_cad.
update public.energy_prices
set is_published = true
where province = 'NS'
  and fuel = 'electricity'
  and unit = 'cents/kWh'
  and source_url = 'https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf'
  and verified_at = '2026-11-22T00:00:00Z'
  and is_published = false
  and (
    (price_cad = 18.324 and effective_from is null)
    or (price_cad = 19.067 and effective_from = '2027-01-01')
  );

commit;
