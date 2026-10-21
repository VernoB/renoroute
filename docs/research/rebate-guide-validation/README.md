# Validation kit: bilingual AI home-upgrade roadmap and rebate guide (New Brunswick)

Idea #1 from the AI arbitrage brainstorm, modelled on Enter.de: a homeowner sends photos and bills and gets a personalized EN/FR upgrade plan, rough costs, likely NB rebates, and a checklist. Revenue comes from paid plans, contractor referrals and Brown's own renovation work.

| File | What it is |
|---|---|
| `rebate-landscape.docx` | Oct 2026 map of NB, federal and municipal programs: amounts, status, official links and homeowner pain points |
| `interview-script.md` | 15–20 min homeowner script (EN + FR), 8–10 min contractor/advisor script, tracker, where to find 25 interviewees |
| `landing-page/index.html` | Single-file bilingual smoke-test page with price test (`?p=49` / `?p=99`), waitlist/reserve form placeholder and disclaimer |
| `ads.md` | 3 Meta ad variants × EN/FR, ~$250 test budget, suggested thresholds |
| `sources/` | Total Home Program Guidelines PDF (1 Jul 2026) and the build script for the docx |

## Working brand name options (.ca checked on 19 Oct 2026 via the CIRA registry RDAP: "not registered" at that moment, with no guarantee it stays free)
1. **RénoRoute**, renoroute.ca. Reads in both languages ("your renovation route"). *Caveat:* a small Brampton, ON cabinetry contractor lists itself as "Reno Route" on Bidmii. Check NUANS/CIPO before you commit.
2. **Maison Chaude**, maisonchaude.ca. Warm and francophone-first ("warm house"); pair it with an EN tagline. No NB business found under this name in a web search.
3. **RénoClé / RenoKey**, renocle.ca and renokey.ca. "Clé" means key. *Caveat:* a Belgian renovation firm uses "Rénoclé" (renocle.be / renocle.com). That's a different market, but it weakens trademark distinctiveness.

*Avoid:* renomap (a French energy-renovation service already uses RenoMap) and anything that looks like NB Power or Save Energy NB branding. Before paying for a domain, also do a quick trademark search on CIPO (Canadian Intellectual Property Office) and a NB corporate registry search.

---

## 30-day checklist (start Monday 19 October 2026)

### Week 1 (Oct 19–25): set up and first conversations
- [ ] Pick the name, register the .ca (~$15–25/yr), and create a free email (hello@).
- [ ] Re-read `rebate-landscape.docx`. Call **1-800-663-6272** (Save Energy NB) with 3 questions: Can a third party help homeowners prepare? Any rules on how I describe it? When will the National Heat Pump Rebate stacking rules be known?
- [ ] **Do 5 homeowner interviews** from your own network or past clients (script A/B). Log them in the tracker.
- [ ] Publish the landing page (Netlify/Cloudflare Pages drop-in, free). Connect the form (Tally/Formspree, free tier) and install the Meta Pixel.
- [ ] Draft **one sample plan** for your own or a friend's house (AI draft, then your edit). This becomes the product demo.

### Week 2 (Oct 26–Nov 1): reach out and launch ads
- [ ] 5 more homeowner interviews (at least 2 in French). Post in 2–3 verified groups (see interview-script §E) after admin approval.
- [ ] **4 contractor/advisor conversations** (script C), including at least 1 of the 4 service organizations (Enercheck, Homesol, ThermalWise, RU-GREEN).
- [ ] Launch ads (`ads.md`): 4 ad sets, ~$25/day.
- [ ] Email every "reserve" signup within 24 h: "Your spot is held. Here's the payment link (Stripe) to confirm and send photos."

### Week 3 (Nov 2–8): deliver and measure
- [ ] Deliver **5 concierge plans** (paid, or free for the first 3 in exchange for a testimonial and a 15-min debrief). Time yourself: target under 60 min each.
- [ ] Ask each plan recipient: "Did you book an evaluation or ask for a quote?" (log yes/no).
- [ ] Day-4 ad check: pause losers and shift budget. Note the $49 vs $99 and EN vs FR results.
- [ ] Ask 3 contractors for a simple referral agreement (fee per booked job). Get it in writing, even by email.
- [ ] *(Optional, Futurpreneur/NBIF track: NBIF Breakthru applications close **Nov 9, 2026**. Only apply if Week 1–3 numbers look good.)*

### Week 4 (Nov 9–18): decide
- [ ] Finish interviews (target total **25**: 15 owners, 3 landlords, 4 contractors, 3 advisors).
- [ ] Fill in the scorecard below and make the go/no-go call on **Nov 18**.

---

## Go / no-go scorecard (day 30)

| # | Signal | GO if ≥ | Result |
|---|---|---|---|
| 1 | Interviews completed (with written notes) | 20 | |
| 2 | Homeowners who describe a **specific past** rebate or upgrade struggle (not hypothetical) | 10 of 15 | |
| 3 | Homeowners who have **already spent money or 5+ hours** trying to figure it out | 5 | |
| 4 | Landing-page signups (waitlist + reserve) | 40 | |
| 5 | "Reserve at founding price" clicks | 12 | |
| 6 | **Paid plans** (any price, real money) | **5** | |
| 7 | Plan recipients who then booked an evaluation or requested a quote | 3 of 5 | |
| 8 | Contractors agreeing in writing to a referral fee or paid-lead pilot | 2 | |
| 9 | Energy advisor or service org open to co-referral (not hostile) | 1 | |
| 10 | Cost per reservation from ads (CAD) | ≤ $40 | |

**Decision rules**
- **GO (build the v1 product):** #6 is met **and** at least 6 of the other 9 are met. Next step: automate intake and plan generation, set the price at the better-converting test price, and approach Futurpreneur/Ignite with real traction numbers.
- **PIVOT:** strong interest (#2, #4) but #6 under 3 paid. Switch to the **contractor-paid model** (free plan for homeowners, referral fee per booked job), or use the plan as a free lead magnet for your own renovation services.
- **PIVOT (segment):** landlords respond better than homeowners. Re-aim at the **Rental Owners Rebate Program** (pre-approval paperwork, up to $500k per site).
- **NO-GO:** #4 under 15 signups **and** #6 under 2 paid **and** no contractor interest. Stop, keep the research as content, and move to brainstorm idea #4 (AI before/after visualisation service) or #2 (FlipScout).

**Kill-switch watch-outs**
- Save Energy NB / NB Power objects to the positioning. Reposition as "prepare for and act on your evaluation". Never offer it as a substitute.
- Federal National Heat Pump Rebate launch rules make everything simple (no audit, 24 h approval). The rebate-confusion pain shrinks for heat pumps, so lean on envelope work (attic, basement, air sealing) and sequencing.

## Guardrails (keep these all 30 days)
- Every plan says: **not an official energy evaluation, no guaranteed rebates, confirm on saveenergynb.ca / econergienb.ca**.
- Re-verify program amounts on the official pages before each plan is sent. Write the "checked on" date in the plan.
- Collect photos and bills only with consent, delete on request, and don't share them with contractors without explicit permission.
- **Flipping note for Brown:** Total Home requires ownership to stay the same through the final evaluation and a finished, habitable house. Rebates generally won't work on a quick flip, so don't market the service as a flipper rebate tool.
