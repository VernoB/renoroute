exec(open('/workspace/rebate-guide-validation/sources/dochelpers.py').read())

p=doc.add_paragraph(); r=p.add_run('NB Home Energy Upgrade Rebates & Programs'); r.bold=True; r.font.size=Pt(22); r.font.color.rgb=NAVY
p=doc.add_paragraph(); r=p.add_run('What a New Brunswick homeowner can actually use in October 2026, and where it gets confusing'); r.font.size=Pt(12.5); r.font.color.rgb=TEAL
p=doc.add_paragraph(); r=p.add_run('Validation kit for the bilingual AI home-upgrade roadmap  ·  Research as of 19 October 2026 (America/Blanc-Sablon time)  ·  Verify on the official pages before quoting to customers'); r.font.size=Pt(9.5); r.font.color.rgb=GREY

H1('1. The short version')
for t in [
 '**One main door is open for most people: NB Power\'s Total Home Energy Savings Program.** You pay $99 + HST for an energy evaluation, then you have nine months to do the work. Rebates come after a final evaluation, usually within 90 days. They are modest per item: $400 per mini-split, $1,500 for a central ducted heat pump, $50 per ENERGY STAR window or door, $250–$550 for air sealing, and insulation paid per square foot.',
 '**The free, income-tested program (Enhanced Energy Savings, household income of $70,000 or less) is full.** NB Power says it is "fully subscribed for the 2025/26 fiscal year and beyond", with a waiting list that "could be up to two years".',
 '**The big oil-to-heat-pump money is gone for new applicants.** In NB, registration for the up-to-$15,000 advance closed 30 June 2026. Paperwork for people already enrolled was due 1 October 2026, and they must finish the work and final evaluation by 31 March 2027, or repay the advance.',
 '**Every federal homeowner program is closed to new applicants.** This covers the Greener Homes Grant, the Greener Homes Loan and Oil to Heat Pump Affordability. The new federal Canada Greener Homes Affordability Program is **not yet** listed as available in NB.',
 '**A new federal National Heat Pump Rebate was announced on 8 October 2026.** It pays up to $10,000 for households below median income and $2,000 for others, with no energy audits. It is expected to launch in early 2027. CBC reports Ottawa is "eyeing" making it retroactive to fall 2026. How it will stack with NB Power rebates has not been published.',
 '**Municipal layer:** no city rebate programs were found in Moncton, Fredericton or Dieppe. Saint John Energy offers heat-pump rentals and up to $10,000 in heat-pump financing. Its $15M on-bill retrofit loan, announced June 2025, has no program page yet.',
]: B(t)
P('**Why this is the pain point:** within 18 months, people saw a grant close, then a loan, then an oil program, then a free program fill up, then a new federal rebate announced without a start date. Official pages from other levels of government still point people to programs that have closed. Homeowners must avoid buying anything before their evaluation, keep receipts that meet detailed rules, and track deadlines across two or three agencies. That is the job a bilingual "upgrade roadmap and rebate checklist" can do.', size=10.5)

# ---------- MAIN TABLE ----------
H1('2. Program-by-program table')
P('Status key: **OPEN** = taking new applicants. **WAITLIST** = registrations accepted but service not soon. **CLOSED** = no new applicants. **ANNOUNCED** = not launched yet. Amounts are as published on the administrator\'s page on the date checked.', size=9.5, italic=True)
L=lambda name,url: (name,url,None)
table(['Program · administrator','Who qualifies','What it pays','Status (Oct 2026)','Official link'],[
 ['**Total Home Energy Savings Program**  ·  NB Power / Save Energy NB (provincial)','Owner of a year-round residential home (Part 9, up to 3 storeys). It must be habitable with finishes in place, at least 6 months old, and you must own it until the final evaluation. Any income level. Customers of other utilities (Saint John Energy, Edmundston, Perth-Andover) are also served.','Rebates after the final evaluation (see section 3): insulation per sq ft, air sealing $250–$550, windows, doors and skylights $50 each, HRV $200, heat pumps $350–$2,000, heat-pump water heater $550, drain-water heat recovery $400, wood or pellet $200–$500. The $99 + HST evaluation fee covers both visits.','**OPEN.** Solar PV rebate ($200/kW) only for those registered by 27 May 2026, with completion by 31 January 2027.',L('saveenergynb.ca/for-home/total-home','https://www.saveenergynb.ca/for-home/total-home/')],
 ['**Enhanced Energy Savings Program**  ·  NB Power, funded by the Government of NB','Household gross income of $70,000 or less (Line 15000, all adults 19+). You must own and live in the home, and it must need major upgrades.','Free upgrades chosen after an evaluation: insulation, air sealing, ventilation, one mini-split for baseboard-heated homes, or an off-oil system with oil-tank removal. Mini-splits come with a 10-year parts and labour warranty.','**WAITLIST.** "Fully subscribed for the 2025/26 fiscal year and beyond", with waits of up to 2 years. The program does not reimburse heat pumps bought while you wait.',L('Enhanced Energy Savings FAQ','https://www.saveenergynb.ca/en/for-home/enhanced-energy-savings-program/faqs/')],
 ['**Oil to Heat Pump Affordability (OHPA)**  ·  NRCan, co-delivered by NB Power','Oil-heated homes. The Total Home stream (income above $70,000) offered an advance payment. The Enhanced stream covers income of $70,000 or less.','Advance of up to $15,000 (Total Home stream) plus a one-time $250 NRCan bonus.','**CLOSED** to new registrations in NB on 30 June 2026. Enrolled participants must have filed paperwork by 1 October 2026 and must complete work and the final evaluation by **31 March 2027**, with no extensions. Nationally, NRCan lists 31 July 2026 as the last application day.',L('OHPA in NB','https://www.saveenergynb.ca/en/for-home/oil-to-heat-pump-affordability/')],
 ['**Rental Owners Rebate Program**  ·  NB Power','Owners of year-round residential rental properties: individuals, companies, non-profits and others. Tenants cannot apply.','Incentives for efficiency upgrades, up to $500,000 per project site and $2M per owner per fiscal year (resets each April). Pre-approval takes about 4–6 weeks, and payment arrives within 60 days of the claim.','**OPEN.** Pre-approval is required before work starts.',L('Rental Owners Rebate Program','https://www.saveenergynb.ca/en/for-business/rental-owners-rebate-program/')],
 ['**New Home Energy Savings Program**  ·  NB Power','New construction only.','Up to $15,000 (performance tiers or prescriptive upgrades).','OPEN (not relevant to existing homes).',L('New Home rebates','https://saveenergynb.ca/en/for-home/new-home/rebates/')],
 ['**Homeowner Repair Program**  ·  NB Housing (GNB)','Low-income owner-occupants needing major repairs.','Forgivable loan of up to $18,000 for major repairs. Separate amounts for accessibility ($15,000) and senior adaptations ($7,000).','OPEN, per the GNB page. Call 1-833-733-7835.',L('gnb.ca – Homeowner repair','https://www.gnb.ca/en/topic/family-home-community/housing-property/home-repair.html')],
 ['**Emergency Fuel Benefit**  ·  NB Social Development','Households in an emergency who cannot pay winter heating costs. Assessed case by case.','Up to $550 per calendar year (heating bills, not upgrades).','OPEN.',L('Emergency Fuel Benefit','https://gnb.ca/content/gnb/en/departments/social_development/services/services_renderer.200993.Emergency_Fuel_Benefit.html')],
 ['**Canada Greener Homes Grant**  ·  NRCan','Was open to all homeowners.','Was up to $5,000 plus up to $600 for evaluations.','**CLOSED.** Intake closed in early 2024. 31 December 2025 was the last day to submit documents.',L('Canada Greener Homes Initiative','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-initiative')],
 ['**Canada Greener Homes Loan**  ·  NRCan','Was open to homeowners with a pre-retrofit EnerGuide evaluation.','Was an interest-free loan of $5,000–$40,000.','**CLOSED.** Last application day was 1 October 2025. The loan portal says funding was fully committed as of 31 March 2026. Approved loans are unaffected.',L('Greener Homes Loan','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-loan')],
 ['**Canada Greener Homes Affordability Program (CGHAP)**  ·  federal, delivered by provinces','Low-to-median-income homeowners and renters (direct install).','No-cost retrofits.','**NOT AVAILABLE IN NB YET.** NRCan lists only BC, MB, NL, NS, PEI and QC as of October 2026. NB residents cannot apply federally.',L('CGHAP','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-affordability-program')],
 ['**National Heat Pump Rebate Program**  ·  ECCC (federal)','Homeowners installing a cold-climate air-source heat pump from the Eligible Products List. One rebate per person.','Up to $10,000 below median income, or $2,000 for others. No pre- or post-audit. Approval within 24 hours and payment approved within 5 days of receipts (as announced).','**ANNOUNCED 8 October 2026.** Launch expected early 2027. Retroactivity to fall 2026 is being considered, per CBC, but not confirmed. Stacking with NB Power rebates has not been published.',L('canada.ca announcement','https://www.canada.ca/en/environment-climate-change/news/2026/10/prime-minister-carney-announces-landmark-investment-to-retrofit-one-million-homes-cutting-energy-costs-and-emissions.html')],
 ['**Saint John Energy: Zero30 heat-pump rental and financing**  ·  city-owned utility','Most New Brunswickers can rent, including outside Saint John. Financing requires a good payment history and credit score with SJE.','Ductless mini-split rental (installed, serviced, replaced) or financing of up to $10,000 over 7 years. Rental starts at $55.36/month with a 3-year minimum and no buyout, according to an independent tracker (fixfirsthome.com, checked 27 September 2026).','**OPEN.** The rental may qualify for the $400 Total Home rebate only with NB Power\'s prior approval of the rental agreement (Total Home guidelines).',L('sjenergy.ca – heat pump rentals','https://sjenergy.ca/products-and-services/heat-pump-rentals')],
 ['**Saint John Energy on-bill retrofit financing**  ·  SJE, with $15M from FCM\'s Green Municipal Fund','To be announced.','Loans for insulation, heat pumps and solar, repaid on the power bill (as announced).','**ANNOUNCED** June 2025. No application page found as of October 2026.',L('FCM news release','https://fcm.ca/en/news-media/news-release/gmf/new-investments-remove-barriers-cost-saving-home-energy-retrofits-saint-john')],
 ['**City of Moncton**','—','No municipal homeowner retrofit rebate. The city\'s incentives page links to provincial and federal programs, **including the closed Canada Greener Homes Grant**.','No city program.',L('moncton.ca – grants and incentives','https://www.moncton.ca/en/enviro-grants-incentives')],
 ['**City of Fredericton**','—','No cash rebate. Lends Home Energy Kits through the Fredericton Public Library.','Kits available.',L('fredericton.ca – Energy Savings','https://www.fredericton.ca/about-fredericton/environmental-initiatives/energy-emissions-plans/energy-savings')],
 ['**City of Dieppe**','—','No municipal heat-pump or retrofit subsidy found. Points residents to provincial and federal programs.','No city program found.',L('dieppe.ca','https://www.dieppe.ca/')],
 ['**Mortgage loan insurance premium refund**','Buyers or owners with insured mortgages who make energy-efficiency upgrades.','Save Energy NB says efficiency upgrades "can help you save up to 25%" on the mortgage insurance premium.','Check with your lender or insurer.',L('Total Home page','https://www.saveenergynb.ca/for-home/total-home/')],
],[3.3,3.6,4.2,3.4,2.5], fs=7.5)

# ---------- TOTAL HOME DETAIL ----------
H1('3. Total Home Energy Savings Program: rebate detail')
P('Source: Save Energy NB rebate pages and the Program Guidelines dated 1 July 2026. Amounts are paid after the final evaluation, against itemized receipts.', size=9.5, italic=True)
H3('Heating, water heating and other equipment')
table(['Upgrade','Incentive','Key condition'],[
 ['Geothermal heat pump','$2,000','On the ground-source list or ENERGY STAR'],
 ['Central ducted air-source heat pump','$1,500','On NB Power\'s qualifying air-source heat pump list'],
 ['Furnace heat-pump add-on','$1,000','ENERGY STAR or on the NB Power list'],
 ['Mini-split heat pump','$400','On the NB Power list. Installed by a licensed refrigeration and air-conditioning mechanic.'],
 ['Multizone heat pump','$350 per indoor head','On the NB Power list'],
 ['Pellet stove; wood or pellet boiler or furnace','$500','EPA or CSA B415.1 rated, WETT-certified installer'],
 ['Wood stove; wood or pellet insert; gas or propane insert','$200','Ratings as listed by Save Energy NB'],
 ['Heat-pump water heater','$550','ENERGY STAR'],
 ['Drain-water heat recovery','$400','42% or higher heat-recovery efficiency'],
 ['Heat recovery ventilator (HRV)','$200','ENERGY STAR'],
 ['Windows, doors, skylights','$50 each','ENERGY STAR (Version 5). Keep the stickers.'],
 ['Air sealing','$250 (10%), $350 (15%), $450 (20%), $550 (25%) reduction','Measured by blower door. Not available if the home already tests at 3 ACH or less.'],
 ['Solar PV','$200/kW','Only if enrolled by 27 May 2026, with the final evaluation by 31 January 2027'],
],[5.5,4.0,7.5])
H3('Insulation (minimum 20% of the component area; dollars per square foot)')
table(['Component','Minimum to add → maximum after','Incentive range'],[
 ['Attic','R-15 → R-60','$0.40 (R-15) to $0.85 (R-60)'],
 ['Exterior / main walls','R-7.5 → R-30','$1.125 to $2.25'],
 ['Basement / crawlspace walls','R-10 → R-30','$1.00 to $2.00'],
 ['Basement header','R-20 → R-40','$1.00 to $3.00'],
 ['Exposed floor','R-10 → R-30','$1.00 to $3.00'],
 ['Basement slab','R-3.5 → R-20','$0.55 to $2.20'],
],[5.5,5.0,6.5])
H3('Rules that trip people up (from the FAQ and the 1 July 2026 guidelines)')
for t in [
 '**Do not buy or install anything before the initial evaluation.** Work done before it is not eligible.',
 '**Nine months from the initial evaluation** to finish the work and book the final evaluation. NB Power says to contact them if you need more time.',
 '**Receipts must be detailed.** They need an invoice header, number and date, contractor name and address, customer name, an itemized description (for example, "added R-60 blown cellulose in attic"), equipment model numbers, AHRI numbers for heat pumps, and the total. Quotes do not count. Program items must be listed separately from other work.',
 '**DIY is allowed** if no licence is required, with receipts for materials. Heat pumps need a licensed mechanic, and electrical work needs a licensed electrician.',
 '**The home must be habitable and finished at evaluation time.** "Major renovation or construction in progress" homes are ineligible. Ownership must not change before the final evaluation. **For flippers, this means a house bought and resold inside nine months generally cannot use Total Home.** The rebate goes with ownership through the final evaluation.',
 '**No incentives for additions or unheated spaces** (garages, porches, newly heated spaces).',
 '**Rented equipment** (for example, an SJE rental) is eligible only with NB Power\'s prior approval of the rental agreement.',
 '**Payment** usually arrives within 90 days of the final evaluation, by e-Transfer or direct deposit if you enrol.',
 '**You can do Total Home and Enhanced, but one at a time.** The Total Home evaluation fee is not reimbursed if you switch.',
]: B(t)

# ---------- PAIN POINTS ----------
H1('4. What\'s confusing or slow for homeowners (the pain points to validate)')
table(['Pain point','Evidence','What the roadmap product could do'],[
 ['**Which program am I even in?**','Five programs in two years closed, filled up or were announced (Grant, Loan, OHPA, Enhanced waitlist, new National Heat Pump Rebate). The City of Moncton\'s incentives page still lists the closed Greener Homes Grant.','A 2-minute eligibility triage (income band, heating fuel, ownership, timing), answered in plain EN/FR, with links to the official page for every claim.'],
 ['**"Do I wait for the federal rebate or act now?"**','The National Heat Pump Rebate was announced 8 October 2026 but won\'t launch until early 2027. Retroactivity and stacking with NB Power are unconfirmed.','A "wait or go" decision note that is updated as rules are published, plus a reminder service ("we\'ll email you the day it opens").'],
 ['**The free program is full**','Enhanced Energy Savings has waits of up to 2 years, and it won\'t reimburse anything bought while waiting.','Explain the trade-off: wait for free upgrades, or do Total Home now and lose Enhanced for those items. Show the dollar difference for their house.'],
 ['**Order of operations**','No purchases before the evaluation. The 9-month clock starts at the evaluation. Envelope before heat pump is recommended (NB Power FAQ). The OHPA hard stop is 31 March 2027.','A personalised step-by-step timeline with deadline reminders, and a checklist to bring to the energy advisor.'],
 ['**Receipt and paperwork rules**','There are 10+ required receipt fields, and quotes are not accepted.','Receipt checklist and template to send to contractors before they invoice. Photo-upload "receipt check".'],
 ['**Rebates feel small against real costs**','For example, $50 per window and $400 per mini-split. Payback on windows is "often not attractive" (NB Power FAQ).','Honest prioritisation: attic, basement and air sealing first, with cost and rebate ranges and the comfort trade-offs explained.'],
 ['**Finding contractors and advisors**','Four service organizations deliver evaluations (Enercheck, Homesol, ThermalWise, RU-GREEN). Contractor quality varies.','Short list of vetted local contractors and the evaluation booking link. Referral revenue.'],
 ['**Language**','Official program sites exist in French (econergienb.ca), but contractors, quotes and third-party advice are often English-only.','Fully bilingual plans, checklists and contractor quote requests.'],
],[3.6,6.4,7.0])

H2('Existing helpers (know your competition)')
B('**Save Energy NB / NB Power** itself: free phone line (1-800-663-6272), Oil to Heat Pump Pathfinder, and service-organization advisors. The certified energy advisor\'s Renovation Upgrade Report is official and prioritised. **Your product must not compete with it or imitate it.** It should prepare people for it and help them act on it.')
B('**Fix First Home** (fixfirsthome.com): an independent, source-verified rebate tracker covering Canadian provinces and US states, including NB items such as the Saint John Energy rental. It is information only and English-first. It shows the "which program is still open" problem is real, but it is a competitor for the free information layer.')
B('**RenoAtlas** (renoatlas.ca): a free renovation planning and checklist tool with Quebec-oriented content. It is adjacent, not rebate-specific.')
B('**Contractors** (for example, heat-pump and insulation companies) often explain rebates as part of selling. That advice is free but biased toward their product.')

H1('5. How to use this document in the validation')
for t in [
 'Use section 1 as your "expert credibility" opener in interviews. Then **stop talking** and ask about their past experience (see interview-script.md).',
 'Before any customer-facing use, re-check every amount on the linked official page and note the date. Programs changed four times in 2026.',
 'Never present your plan as an energy evaluation, an EnerGuide rating or a guarantee of rebates. Always link to the official program page.',
 'Watch canada.ca for National Heat Pump Rebate launch details (portal, eligible products list, stacking). It is the biggest change coming and a timely hook for ads.',
]: N(t)

H1('6. Sources (all checked 19 October 2026)')
srcs=[
 ('Save Energy NB – Total Home Energy Savings Program','https://www.saveenergynb.ca/for-home/total-home/'),
 ('Total Home FAQ ($99 + HST fee, receipts, OHPA deadlines, solar cut-off)','https://saveenergynb.ca/en/for-home/total-home/frequently-asked-questions/'),
 ('Total Home Program Guidelines, 1 July 2026 (PDF)','https://www.saveenergynb.ca/media/sjaf0agg/totalhome_energy_savings_program_guidelines_en_senb_01jul2026.pdf'),
 ('Insulation rebates','https://saveenergynb.ca/en/for-home/total-home/rebates/insulation-rebates/'),
 ('Space heating equipment rebates','https://saveenergynb.ca/en/for-home/total-home/rebates/space-heating-equipment-rebates/'),
 ('Water heating equipment rebates','https://saveenergynb.ca/en/for-home/total-home/rebates/water-heating-equipment-rebates/'),
 ('Additional rebates (windows, HRV, solar, air sealing)','https://www.saveenergynb.ca/en/for-home/total-home/rebates/additional-rebates/'),
 ('Enhanced Energy Savings Program FAQ (waitlist up to 2 years)','https://www.saveenergynb.ca/en/for-home/enhanced-energy-savings-program/faqs/'),
 ('Oil to Heat Pump Affordability in NB','https://www.saveenergynb.ca/en/for-home/oil-to-heat-pump-affordability/'),
 ('NRCan – OHPA eligibility (31 July 2026 national last day)','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/eligibility-criteria-oil-heat-pump-affordability-program'),
 ('Service organizations (energy advisors)','https://www.saveenergynb.ca/en/save-energy/residential/total-home-energy-savings-program/service-organizations/'),
 ('Rental Owners Rebate Program','https://www.saveenergynb.ca/en/for-business/rental-owners-rebate-program/'),
 ('French-language program site (ÉconergieNB)','https://www.econergienb.ca/pour-votre-maison/programme-econergetique-pour-les-maisons/'),
 ('NRCan – Canada Greener Homes Initiative (Grant/Loan closed)','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-initiative'),
 ('Canada Greener Homes Loan portal (fully committed 31 March 2026)','https://www.cghli.ca/home'),
 ('NRCan – CGHAP participating provinces','https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/canada-greener-homes-affordability-program'),
 ('Canada.ca – National Heat Pump Rebate backgrounder (8 Oct 2026)','https://www.canada.ca/en/environment-climate-change/news/2026/10/prime-minister-carney-announces-landmark-investment-to-retrofit-one-million-homes-cutting-energy-costs-and-emissions.html'),
 ('CBC – What we know about the $2B heat pump rebate (timing, retroactivity)','https://www.cbc.ca/news/canada/canada-heat-pump-retrofit-faq-9.7374613'),
 ('Saint John Energy – Zero30 heat pump rentals and financing','https://sjenergy.ca/products-and-services/heat-pump-rentals'),
 ('Energy Manager – SJE secures $15M from GMF (June 2025)','https://www.energy-manager.ca/saint-john-energy-secures-15m-from-gmf-to-support-residential-retrofit-program/'),
 ('Fix First Home – independent tracker (SJE rental pricing, national context)','https://fixfirsthome.com/programs/saint-john-energy-heat-pump-rental/'),
 ('City of Moncton – Environmental grants and incentives','https://www.moncton.ca/en/enviro-grants-incentives'),
 ('City of Fredericton – Energy Savings','https://www.fredericton.ca/about-fredericton/environmental-initiatives/energy-emissions-plans/energy-savings'),
 ('GNB – Homeowner repair program','https://www.gnb.ca/en/topic/family-home-community/housing-property/home-repair.html'),
 ('GNB – Emergency Fuel Benefit','https://gnb.ca/content/gnb/en/departments/social_development/services/services_renderer.200993.Emergency_Fuel_Benefit.html'),
]
for name,url in srcs:
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(1)
    r=p.add_run(name+': '); r.font.size=Pt(9); add_link(p,url,url,size=8)
P('Not found or not verified: no active municipal PACE or local-improvement-charge home retrofit program was found in Moncton, Fredericton, Saint John or Dieppe. Edmundston Energy customers use the Save Energy NB programs, and no separate Edmundston rebate was found. If you hear otherwise in interviews, that is a useful finding. Record it.', italic=True, color=GREY, size=9)

for s in doc.sections:
    fp = s.footer.paragraphs[0]; fp.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=fp.add_run('NB rebate landscape · research as of 19 Oct 2026 · verify before quoting · page '); r.font.size=Pt(8); r.font.color.rgb=GREY
    for kind,txt in [('begin',None),(None,'PAGE'),('end',None)]:
        run=fp.add_run(); run.font.size=Pt(8)
        if kind:
            fc=OxmlElement('w:fldChar'); fc.set(qn('w:fldCharType'),kind); run._r.append(fc)
        else:
            it=OxmlElement('w:instrText'); it.set(qn('xml:space'),'preserve'); it.text=txt; run._r.append(it)
doc.core_properties.title='NB Home Energy Upgrade Rebates & Programs (Oct 2026)'; doc.core_properties.author='Brown Verno / Phaneroo Ventures'; doc.core_properties.language='en-CA'
doc.save('/workspace/rebate-guide-validation/rebate-landscape.docx'); print('ok')
