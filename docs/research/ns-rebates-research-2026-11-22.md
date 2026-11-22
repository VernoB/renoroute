# RenoRoute – Nova Scotia: home energy-upgrade rebates, grants, loans and energy prices

Checked: **2026-11-22** (all pages below were opened on this date; America/Blanc-Sablon time).
Rule followed: only official pages (efficiencyns.ca, novascotia.ca, halifax.ca, canada.ca, plus NS Power / NS Energy Board / Statistics Canada for prices). Anything a page does not say is written **"not stated"**. Nothing below is invented; amounts are copied as written.

---

## Résumé en français (pour Brown)

**Mauvaise nouvelle pour les deux brouillons du développeur :**
- `ns-home-heating-system-rebates` : le programme **est fermé depuis le 31 décembre 2025**. Efficiency Nova Scotia (ENS) renvoie maintenant vers l’**évaluation énergétique résidentielle** (Home Energy Assessment) et la **remise pour revenu modéré** (Moderate Income Rebate). Ce brouillon doit passer au statut « fermé » ou être retiré.
- `ns-program-rebate-finder` : c’est seulement un questionnaire d’orientation, sans montant. À garder comme lien utile, pas comme programme.

**Ce qui est ouvert en Nouvelle-Écosse (22 nov. 2026) :**
1. **Home Energy Assessment (ENS)** : évaluation à 199 $ (gratuite si revenu modéré), puis jusqu’à **5 000 $** de remises (isolation, thermopompes, fenêtres, etc.), travaux à finir **dans les 12 mois**.
2. **Moderate Income Rebate (Province/ENS)** : jusqu’à **5 000 $ de plus** (réduit de 10 000 $ à 5 000 $), cumulable avec l’évaluation, **max. 10 000 $** au total. Maison chauffée surtout **sans électricité** et revenu sous les plafonds.
3. **HomeWarming (ENS)** : évaluation et travaux **gratuits** pour les propriétaires à faible revenu (ex. 1 personne : 30 187 $).
4. **Free Product Installation (ENS)** : thermostat intelligent **gratuit** (valeur jusqu’à 160 $) pour les maisons chauffées à l’électricité.
5. **Instant Rebates (ENS)** : remises en magasin (chauffe-eau thermopompe 800 $, thermostat 45 $, etc.).
6. **African Nova Scotian Communities Retrofit (ENS)** : pour les propriétaires afro-néo-écossais de certaines communautés.
7. **Fédéral : Programme national de remise pour les thermopompes** : **2 000 $**, ou **jusqu’à 10 000 $** sous le revenu médian (N.-É., 1 personne : 38 831 $). Portail **début 2027**, mais les installations **depuis le 1er novembre 2026** pourront compter (garder les reçus, numéro AHRI).
8. **Halifax : Solar City** (solaire) et **HalifACT Home Energy Upgrade** (thermopompe/isolation pour quitter le mazout) : financement municipal à **4,75 % sur 10 ans**, remboursé par une charge sur la propriété.
9. **Programme d’aide au chauffage (Province)** : 400 $ pour payer le chauffage (pas des travaux), demandes jusqu’au 31 mars 2027.

**Fermés :** Oil to Heat Pump Affordability en N.-É. (fermé aux nouvelles demandes le 2 juillet 2026), Subvention et Prêt canadiens pour des maisons plus vertes, SolarHomes, Eco Shift (en pause), MHEEP, recyclage d’électroménagers, Clean Energy Financing.

**Points à faire vérifier / à noter :**
- ENS n’a **aucune page en français** : pas de nom officiel français pour ses programmes. Il faudra une traduction maison, marquée comme telle.
- La page OHPA d’ENS se contredit : une bannière dit que « des places supplémentaires » sont offertes via les partenaires, la FAQ dit que c’est fermé depuis le 2 juillet 2026. À afficher comme « fermé aux nouvelles demandes, appeler ENS ».
- Prix de l’énergie : électricité NS Power 18,324 ¢/kWh + frais mensuel 20,08 $ (+ suppléments), hausse prévue au 1er janvier 2027. Mazout : pas réglementé en N.-É. ; Statistique Canada donne 248,1 ¢/L à Halifax en octobre 2026. Propane : aucune source officielle trouvée.

---

## A. Verdict on the developer's two drafts

| Draft slug | What the official page says (2026-11-22) | Recommended action |
|---|---|---|
| `ns-home-heating-system-rebates` | Page title "Home Heating System Rebates (Closed)". Text: "As of December 31, 2025, the Heating System Rebates Program is closed and no longer accepting applications. We are proud to offer larger and more comprehensive rebates through our Home Energy Assessment and Moderate Income Rebate programs." Meta description also says "Eco Shift is paused to new enrollment." | Set `status = closed`, `closed_on = 2025-12-31`, no amount. Do not publish as an available rebate. Point users to `ns-ens-home-energy-assessment` and `ns-moderate-income-rebate`. |
| `ns-program-rebate-finder` | "Find Programs & Rebates for You … our quiz makes it easy to find the program or rebate opportunity that's right for you. Answer a few simple questions and get personalized recommendations." No amounts, no rules. | Keep as a **resource link** (type = tool/index), not a program. `amount = not applicable`. |

---

## B. Developer table (DB-ready)

Legend for `status`: `open`, `announced` (not yet accepting applications), `paused`, `closed`, `index`.
`name_fr`: only an official French name found on an official page; otherwise "no official French name found".

| # | slug (suggestion) | name_en | name_fr | administrator | source_url | amount_text (as stated) | eligibility (key points) | completion window (if stated) | status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ns-ens-home-energy-assessment | Home Energy Assessment | no official French name found | Efficiency Nova Scotia (Delivery Agent Partners / Registered Energy Advisors) | https://www.efficiencyns.ca/programs-rebates/home-energy-assessments | Assessment fee $199 ("We'll waive the $199 fee for households that meet our income threshold"). "You may qualify for rebates of up to $5,000". Per-measure amounts: see section C.1 | Home in NS, ≥ 6 months old (occupancy permit), not yet started renovations, connected to grid, livable condition; proof of ownership; "All Nova Scotia homeowners, regardless of income level or heating type, can receive up to $5,000". Pre-assessment **required**. Heat pumps installed by certified RACM; wood equipment WETT. Equipment new, bought in Canada. | Upgrades within **12 months** of initial assessment; rebate cheque "within 90 days" of final assessment | open |
| 2 | ns-moderate-income-rebate | Moderate Income Rebate (MIR) | no official French name found | Province of Nova Scotia, delivered by Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/moderate-income-rebate | "The provincial Moderate Income Rebate (MIR) top-up has been reduced from a maximum of $10,000 to $5,000." "The Home Energy Assessment (HEA) rebate maximum remains $5,000. Customers can continue to stack MIR and HEA rebates, for a total maximum of up to $10,000." Free HEA for MIR participants. Per-measure amounts: section C.2 | Own the home, primary residence, **primarily heated with non-electric sources** (wood stoves not a primary source; "Electrically heated homes are not eligible"). After-tax household income limits: 1 person $37,260; 2 people $77,050; 3 people $98,900; 4 people $120,750; 5+ people $126,500. Must be **pre-approved** before other steps. Docs: Notice of Assessment for all adults (T1/T4 not accepted) + proof of ownership. | Same as HEA (12 months); decision on application "within 10 business days" for most applicants | open |
| 3 | ns-homewarming | HomeWarming | no official French name found | Efficiency Nova Scotia (funded by Province of NS + DSM) | https://www.efficiencyns.ca/programs-rebates/homewarming | "Free assessment and upgrades … we'll arrange the installation and cover the cost, with no upfront cost to you." No dollar cap stated. Since OHPA closure: "HomeWarming support will focus on eligible building envelope upgrades and, where applicable, a single-zone heat pump" (no whole-home heat pump). | Lower-income homeowners; after-tax income limits: 1 person $30,187; 2 to 4 people $57,075; 5 or more people $79,163 (LICO-based, updated each spring). Year-round primary residence, not planning to sell for 12 months. Renters not eligible. Most mobile homes qualify. | not stated; decision "4 to 6 weeks" | open |
| 4 | ns-ens-free-product-installation | Free Product Installation | no official French name found | Efficiency Nova Scotia (installers Homesol or Summerhill) | https://www.efficiencyns.ca/programs-rebates/free-product-installation | "Get your free smart thermostat–valued at up to $160–professionally installed at no cost". Other free products possible (motion sensors, solar security lights, bath-fan humidity sensors, aerators, showerheads, thermostatic shower valves). | **Electrically heated** homes with a residential utility rate code; occupied year-round; renters need landlord written permission; existing thermostats analog or non-programmable digital. | not stated | open |
| 5 | ns-ens-instant-rebates | Instant Rebates | no official French name found | Efficiency Nova Scotia (participating retailers) | https://www.efficiencyns.ca/programs-rebates/instant-rebates | Smart thermostats for electric heating $45; ENERGY STAR heat pump water heaters $800; variable-speed pool pumps $200; ENERGY STAR heat pump clothes dryers $150; outside clothesline kits $5 (all "Rebate Amount", applied at checkout) | Purchase at participating retailers (thermostats also online); eligible models lists on ENS site. HEA guide: HPWH rebate under HEA only if no instant rebate was received. | at checkout | open |
| 6 | ns-african-nova-scotian-communities-retrofit | African Nova Scotian Communities Retrofit Program | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/african-nova-scotian-communities-retrofit-program | No dollar amount stated. Above moderate income: free home energy assessment, recommendations, product installations, other rebates. Low-to-moderate income: "additional support and incentives". | African Nova Scotian homeowner (or someone in the home is); live in eligible community (Preston Township: North Preston, East Preston, Cherry Brook, Lake Loon; also Sunnyville, Lincolnville, Upper Big Tracadie, Monastery, Mulgrave — as listed); proof of ownership. Income limits for extra support same as MIR ($37,260 … $126,500). | not stated | open (no closing date stated) |
| 7 | ca-national-heat-pump-rebate | National Heat Pump Rebate | Programme national de remise pour les thermopompes | Government of Canada (Environment and Climate Change Canada) | https://www.canada.ca/en/environment-climate-change/campaigns/one-million-home-energy-retrofits.html (details: …/one-million-home-energy-retrofits/supplemental-eligibility-program-details.html; FR: https://www.canada.ca/fr/environnement-changement-climatique/campagnes/renovations-ecoenergetiques-un-million-logements.html) | "$2,000 for above-median income households"; "up to $10,000 for low- to median-income households (not exceeding the total costs of installation)". NS after-tax median thresholds: 1 person 38,831; 2 persons 80,300; 3 persons 103,071; 4 persons 125,843; 5+ 131,835. | Own the home (need not be primary residence); one rebate per household; heat pump on the eligible product list (AHRI number), whole-home capable, bought from and installed by an HVAC contractor; any starting fuel (electric, oil, propane, gas, wood…); **no pre/post energy audit**; no prior federal heat pump funding (CGHG/OHPA) at the address; homeowner must apply (no contractor applications). | Portal "expected to open in early 2027"; installs **on or after Nov 1, 2026** may be eligible retroactively; receipts within 6 months; program to close March 2034. "Parameters … still being finalized and remain subject to change." Stacking: "Additional details will be provided before program launch." | announced (retroactivity active) |
| 8 | ns-oil-to-heat-pump-affordability | Oil to Heat Pump Affordability (OHPA) – Nova Scotia | Programme pour la Conversion abordable du mazout à la thermopompe (federal name) | Government of Canada; Efficiency Nova Scotia = delivery partner in NS | https://www.efficiencyns.ca/programs-rebates/oil-to-heat-pump-affordability-program | ENS page: no amount stated. canada.ca: "Up to $25,000 — Grants or direct installation of a heat pump … in participating provinces … Funding amounts and program requirements vary" + "$250 additional" one-time incentive. | Owner, primary residence; income limits as MIR; primarily oil heated, ≥ 500 L in previous 12 months; cold-climate heat pumps on ENS lists. | — | **closed** to new applicants: "Beginning July 2, 2026, new OHPA applications will no longer be accepted." ⚠ Same page also shows a banner: "Additional OHPA spots have become available for customers working directly with our Partner Network." Conflict on the official page; show as closed + "contact ENS". |
| 9 | ns-ens-home-heating-system-rebates | Home Heating System Rebates | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates | none (closed) | — | — | closed (Dec 31, 2025) |
| 10 | ns-ens-eco-shift | Eco Shift (demand-response pilot) | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/eco-shift | Existing participants: smart thermostats $30 cash back + gift card draws ($100; six $500); hot water controllers $20 cash back (events Dec 1, 2026 – Feb 28, 2027) | NS Power customer, authorized account name; Time-of-Day rate not eligible | — | paused ("paused to new enrollments as of April 9, 2026") |
| 11 | ns-ens-mheep | Mi’kmaw Home Energy Efficiency Project (MHEEP) | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/mikmaw-home-energy-efficiency-project | Assessment and upgrades "at no cost to the participant or community" | Homes within First Nations communities in NS | Project complete by March 31, 2027 | closed ("MHEEP will close permanently to applications on June 15, 2026") |
| 12 | ns-ens-solarhomes | SolarHomes | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/solarhomes | none for homeowners (non-profit pilot: $0.60/W DC, up to 25%, max $15,000 — not for homeowners) | — | Approved projects had to be done by March 31, 2026 | closed to homeowners (stopped Apr 17, 2025) |
| 13 | ns-ens-appliance-retirement | Appliance Retirement Program (Fridge & Freezer Recycling) | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/fridge-and-freezer-recycling | none | — | — | closed (Jan 8, 2025) |
| 14 | ca-greener-homes-grant | Canada Greener Homes Grant | Subvention canadienne pour des maisons plus vertes | Natural Resources Canada / Government of Canada | https://www.canada.ca/en/environment-climate-change/services/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative.html | none (closed) | — | "December 31, 2025, was the last day to submit your documents." | closed |
| 15 | ca-greener-homes-loan | Canada Greener Homes Loan | Prêt canadien pour des maisons plus vertes | Government of Canada (CMHC portal) | https://www.canada.ca/en/environment-climate-change/services/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan.html | Was: Maximum $40,000, Minimum $5,000, 10 years interest-free. "New loan applications cannot be approved." | — | Approved loans unaffected | closed |
| 16 | hfx-solar-city | Solar City | no official French name found | Halifax Regional Municipality | https://www.halifax.ca/home-property/solar-projects/about-solar-city | Financing (not a rebate): voluntary Local Improvement Charge (LIC) repaid "over a period of 10 years at a fixed interest rate (4.75%)", prepay without penalty. Max amount not stated. | Property within HRM, taxes/charges up to date; residential owners, non-profits, places of worship, co-ops, charities; PV, solar hot air, solar hot water; parts of system must produce ≥ 70% of optimal; contractor third-party reviewed; agreement signed before install. | not stated | open (registration form live) |
| 17 | hfx-halifact-home-energy-upgrade | HalifACT Home Energy Upgrade (HHEU) | no official French name found | Halifax Regional Municipality (Navigator: switchpace.org) | https://www.halifax.ca/about-halifax/environment-climate-change/halifact-energy-upgrade | "financing for heat pumps, insulation and electric water heaters at an interest rate of 4.75 per cent over 10 years" via LIC. Max amount not stated. | Home in HRM **built before 2000**, good financial standing, not used to generate revenue; upgrades: switch off oil (heat pumps on ENS ducted/ductless lists, oil tank decommissioning, electrical upgrade…), insulation. Solar not included (use Solar City). | not stated | open ("Program registration now open") |
| 18 | ns-clean-energy-financing | Clean Energy Financing (multi-municipal PACE) | no official French name found | Clean Foundation with participating municipalities | https://cleanenergyfinancing.ca/ (program site, not a gov domain) | none | Was offered in Amherst, Bridgewater, Cumberland County, East Hants, District of Lunenburg, Victoria County, Barrington, Chester, Digby, Inverness County, New Glasgow, Yarmouth | — | closed ("This program has ended and is no longer accepting applications") |
| 19 | ns-heating-assistance-rebate | Heating Assistance Rebate Program (HARP) | Programme d’aide au chauffage (title of the official French application form on novascotia.ca) | Province of NS – Department of Service Nova Scotia | https://www.novascotia.ca/apply-heating-assistance-rebate-heating-assistance-rebate-program | "Rebates are $400 for each household." (bill help, not an upgrade) | Pay your own residential heat; 2025 net income ≤ $30,000 living alone, or household ≤ $45,000 with others; or on Income Assistance / GIS / Allowance. | Apply 1 Oct 2026 – 31 Mar 2027 | open |
| 20 | ns-ens-energyforward-new-homes | EnergyForward New Homes | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/programs-rebates/energyforward-new-homes | "up to $25,000 in incentives" ($15,000 / $20,000 / $25,000 for $1,000 / $500 / $0 yearly energy cost targets) | New construction only; contact a Service Organization before building; oil-heated homes ineligible. **Out of scope for renovations.** | not stated | open |
| — | ns-program-rebate-finder | Program and Rebate Finder | no official French name found | Efficiency Nova Scotia | https://www.efficiencyns.ca/program-rebate-finder | not applicable (quiz) | — | — | index |

Programs counted: **20** (+ 1 index page). Open or active for homeowners doing renovations: #1–#7, #16, #17 (plus #19 for bill help).

Not included: ENS business/non-profit/agriculture programs; Canada Greener Homes Affordability Program (federal page says it is "delivered through our partners in provinces and territories"; no NS-specific page found linking it to a named NS program — **not stated**); NS Power heat pump financing (mentioned in ENS HomeWarming FAQ: "Nova Scotia Power offers a financing program for heat pumps", but I could not find a current official NS Power page with terms — **not verified**); Switch PACE in other municipalities (no official municipal page checked).

---

## C. Per-measure rebate tables (from "Home Energy Assessment Rebate Guide", Aug 2026)

Source PDF: https://assets.ctfassets.net/hro74sf4x6k2/3WUCMiBurFYsS5L8O0Dg0K/e980fabca778e3ed2e7c2a0b4ff8e56a/Home-Energy-Assessment-Rebate-Guide-Aug-2026.pdf (linked from the ENS HEA and MIR pages).

General criteria (all programs in the guide): home in NS with proof of ownership; ≥ 6 months old, grid-connected; livable condition; eligible dwelling types (single/semi, row house, mobile home on permanent foundation, floating home, mixed-use ≥ 50% residential, low-rise MURB; some buildings up to 6 units — call ENS); new equipment; bought and installed between initial and final assessment; "Rebate totals are capped at 100% of costs incurred"; keep receipts 5 years; equipment bought in Canada; no double rebates with other ENS programs (e.g., HomeWarming) for the same upgrade. Radon attestation required before the initial assessment.

### C.1 Home Energy Assessment rebates (all homeowners, max $5,000)

| Measure | Criteria | Rebate as stated |
|---|---|---|
| Attic insulation | Increase to R-50, ≥ 20% of area; starting R-12 or less / R-13–R-25 / R-26–R-35 | $150 - $750 / $75 - $375 / $25 - $125 |
| Flat roof / cathedral ceiling | to R-20 from R-0; to R-28 from R-12 or less / R-13–R-25; ≥ 20% of area | $100 - $500; $150 - $750 / $50 - $250 |
| Exterior walls | add R-3.8–R-7.4 / add R-7.5+; ≥ 20% of area | $180 - $900 / $300 - $1,500 |
| Exposed floor | add ≥ R-20, 100% of area, ≥ 120 ft² | $200 |
| Basement walls | add R-10–R-22 / add R-22+; ≥ 20% of area | $120 - $600 / $240 - $1,200 |
| Basement wall header | add ≥ R-20, ≥ 80% of area | $120 - $150 |
| Crawlspace walls & header | add R-10–R-22 / R-22+; 100% of area | $480 / $960 |
| Floor above crawlspace | add ≥ R-24, 100% | $240 |
| Basement slab | add ≥ R-3.5, ≥ 50% of area | $100 - $200 |
| Ductless mini-split heat pump | on ENS heat pump list; RACM installer; based on newly added capacity | $300 per ton |
| Centrally ducted heat pump | same | $500 per ton |
| Geothermal (closed/open loop) | COP thresholds; ≤ 40 kW / 135k Btu/h; RACM | $600 per ton |
| Heat pump water heater | ENERGY STAR, energy factor thresholds; not if instant rebate already received | $800 |
| Wood stove / pellet stove | CSA-B415.1-10 or US EPA; WETT installer/inspector | $500/unit |
| Pellet boiler / wood boiler / ducted furnace | same | $1,000/unit |
| Windows & doors | ENERGY STAR rated in Canada, replace incl. frame | $30 per rough opening |
| Air sealing | reach target in upgrade report | $200 |
| HRV / ERV | new HVI-certified unit | $300 |

Notes as stated: semi-detached/end-unit row homes get 75% of foundation/wall max, middle units 50%; not eligible: replacement heat pumps, ducted/compact ducted/mixed-ducted mini-splits, DX/water-to-water/brine-to-water geothermal, equipment in unconditioned space; working wood equipment replacement not eligible; outdoor systems not eligible. 1 ton = 12,000 BTU/h.

### C.2 Moderate Income Rebate top-ups (pre-approved MIR participants only, max $5,000; stack with C.1)

| Measure | Criteria | MIR rebate as stated |
|---|---|---|
| Exterior walls | add R-3.8–R-7.4 / R-7.5+; ≥ 20% | $120 - $600 / $200 - $1,000 |
| Basement walls | add R-10–R-22 / R-22+; ≥ 20% | $75 - $375 / $150 - $750 |
| Crawlspace walls & header | R-10–R-22 / R-22+; 100% | $300 / $600 |
| Floor above crawlspace | add ≥ R-24; 100% | $150 |
| Ductless mini-split heat pump | on list, RACM | $500 per ton |
| Centrally ducted heat pump | on list, RACM | $1,500 per ton |
| Wood stove / pellet stove | CSA/EPA; WETT | $250/unit |

---

## D. Application steps (as stated)

- **Home Energy Assessment:** (1) if moderate income, apply to MIR first; (2) book initial assessment with a Delivery Agent Partner ($199, or free if MIR-approved); (3) get EnerGuide label + Renovation Upgrade Report; (4) do upgrades with contractors (≥ 3 quotes recommended, permits, keep invoices, photos), within 12 months; (5) book final assessment with the same advisor; (6) rebate cheque within 90 days.
- **MIR:** check income → prepare Notice of Assessment for all adults 18+ and proof of ownership → apply online → welcome letter + case number (waives $199) → continue HEA steps.
- **HomeWarming:** same two documents → apply online or PDF (mail/fax) → 4–6 weeks → free assessment → ENS approves and schedules contractors → final assessment.
- **National Heat Pump Rebate (from early 2027):** create account + apply with AHRI number (SIN for higher amount) → eligibility in ~24 h → install → upload banking + invoices → review ~5 days → direct deposit. Retroactive installs (from Nov 1, 2026): apply after launch, within 6 months of installation.
- **Halifax Solar City / HHEU:** register online with Assessment Account Number → eligibility confirmed → choose contractor (Solar City: ≥ 3 quotes) → municipal review + signed participant agreement before work → install → completion report → municipality pays contractor → LIC invoice to owner.

---

## E. Energy price sources (for `energy_prices`)

| Fuel | Value as stated | Source | Notes |
|---|---|---|---|
| Electricity – NS Power Domestic Service Tariff (rate codes 02, 03, 04) | Customer charge **$20.08/month**; energy charge **18.324 ¢/kWh** ("Effective upon the date of the Board's Order"). From **Jan 1, 2027: $21.04/month and 19.067 ¢/kWh**. | NS Power Tariffs, May 2026: https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf | Riders added per kWh: FAM AA/BA combined **0.156 ¢/kWh** (2026 and Jan 1, 2027 tables); DSM Cost Recovery Rider **0.648 ¢/kWh** (Jan 1–Dec 31, 2026); Storm rider **0.000 ¢/kWh** (2026). My arithmetic, not a published figure: 18.324 + 0.156 + 0.648 + 0 = 19.128 ¢/kWh before HST. Exact Board order date not stated in the PDF. Regulator is now the **Nova Scotia Energy Board (NSEB)** (NS Power rates page). |
| Heating oil (household heating fuel) | **248.1 ¢/L, Halifax, October 2026** (Sep 2026: 230.8; Aug: 210.2) | Statistics Canada table 18-10-0001-01 (Monthly average retail prices for gasoline and fuel oil), vector v735158: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000101 | Not regulated in NS: the NSEB weekly schedule (effective Nov 20, 2026) prescribes only gasoline and ultra-low-sulfur diesel; it has no furnace oil or propane rows. |
| Propane | not stated – no official NS price source found | — | Mark TODO(verify). |
| Gasoline/diesel (reference only) | Zone 1 regular self-serve 156.0–159.0 ¢/L; ULSD 233.4–236.4 ¢/L (effective Nov 20, 2026) | NSEB price schedule: https://nserbt.ca/sites/default/files/documents/gas/gasprice.pdf | Not needed for home heating. |

---

## F. Pages I could not access / caveats

- `https://www.efficiencyns.ca/programs-rebates/african-nova-scotian-communities-retrofit` → 404 (correct URL ends with `-program`, used instead).
- `canada.ca` pages could not be downloaded from the research machine (connection reset); I read them through the web fetch tool instead. `…/canada-greener-homes-initiative/participating-provinces-territories.html` → 404.
- NS Power heat pump financing page: no current official page found (guessed URLs 404).
- WebFetch returned empty pages for efficiencyns.ca (the site is a JavaScript app); content was read from the page data with curl instead. Text could be read, but the image-only content was not checked.
- **No French pages on efficiencyns.ca or halifax.ca** (no /fr in the ENS sitemap). Every ENS and Halifax `name_fr` = "no official French name found". RenoRoute FR labels for these must be marked as unofficial translations.
- The federal French announcement also uses "Programme national de rabais pour les thermopompes" once; the campaign pages use "Programme national de remise pour les thermopompes" (used above).
- ENS OHPA page contradicts itself (closed July 2, 2026 vs. "Additional OHPA spots … through our Partner Network" banner).
