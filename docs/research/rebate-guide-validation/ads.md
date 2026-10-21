# Facebook / Instagram smoke-test ads: NB home-upgrade roadmap

Working brand in the copy: **RénoRoute** (swap in your final name). The landing page is `landing-page/index.html`. Use one URL per ad so you can tell which ad produced each signup:

```
https://YOURDOMAIN/?lang=en&p=49&utm_source=meta&utm_campaign=nb_smoke&utm_content=A_en
https://YOURDOMAIN/?lang=fr&p=99&utm_source=meta&utm_campaign=nb_smoke&utm_content=B_fr
```
`p` = price shown on the page (49 or 99). `utm_content` = variant and language.

> **Policy guardrails (Meta advertising standards):**
> - Don't imply you know someone's personal attributes. Write "Heating with oil or baseboards?" and avoid "Are you low-income?"
> - Don't use NB Power or government logos. Don't imply you are affiliated with them.
> - Don't promise savings or rebates.
> - Meta may treat home-related services as a **Special Ad Category (Housing)**. If you're asked to declare it, or the ad gets flagged, age targeting is fixed at 18–65+, gender can't be restricted, and location becomes a minimum radius of about 25 km (15 miles) with no postal-code targeting. The plan below works either way: target by city radius, not demographics.

---

## Variant A: "The rebate maze" (pain)

**EN**
- **Primary text:** Rebates for NB homes keep changing. The Greener Homes grant and loan closed, oil-to-heat-pump advance funding stopped taking registrations June 30, and the free NB Power program has a waitlist of up to 2 years. Get a plain-English plan: what to fix first, what it costs, and which rebates you can still get.
- **Headline:** Your NB home-upgrade plan, sorted
- **Description:** From a local renovator. Not affiliated with NB Power.
- **CTA button:** Learn more
- **Creative idea:** a phone photo of a messy kitchen table covered in bills and printouts, with the text overlay "Which rebates are still open?"

**FR**
- **Texte principal :** Les remises pour les maisons du N.-B. changent sans arrêt. La subvention et le prêt Maisons plus vertes sont fermés, les inscriptions au financement anticipé « du mazout à la thermopompe » ont pris fin le 30 juin, et le programme gratuit d'Énergie NB a une liste d'attente pouvant aller jusqu'à 2 ans. Recevez un plan clair : quoi régler en premier, combien ça coûte, et les remises encore offertes.
- **Titre :** Votre plan de rénovation au N.-B., clair et simple
- **Description :** Par un rénovateur d'ici. Non affilié à Énergie NB.
- **Bouton :** En savoir plus
- **Visuel :** même photo, texte « Quelles remises sont encore ouvertes ? »

## Variant B: "New federal heat-pump rebate: wait or go?" (news hook)

**EN**
- **Primary text:** Ottawa announced a new heat pump rebate on Oct. 8 (up to $10,000 for some households), but it doesn't open until early 2027. Should you wait or upgrade now with NB Power rebates? Get a personalized "wait or go" plan for your house.
- **Headline:** Heat pump now, or wait for 2027?
- **Description:** Personalized plan + rebate checklist. Bilingual.
- **CTA:** Learn more
- **Creative idea:** an outdoor heat-pump unit in snow, with the overlay "Wait or go?"
- *Note: update the copy the day launch details (portal date, stacking rules) are published on canada.ca. Never say "guaranteed".*

**FR**
- **Texte principal :** Ottawa a annoncé le 8 octobre une nouvelle remise pour thermopompes (jusqu'à 10 000 $ pour certains ménages), mais elle n'ouvrira qu'au début de 2027. Attendre, ou rénover maintenant avec les remises d'Énergie NB ? Recevez un plan « attendre ou agir » adapté à votre maison.
- **Titre :** Thermopompe maintenant, ou attendre 2027 ?
- **Description :** Plan personnalisé + liste des remises. Bilingue.
- **Bouton :** En savoir plus

## Variant C: "Cold room, local renovator" (comfort and trust)

**EN**
- **Primary text:** That one cold room every winter? I'm a New Brunswick renovator. Send me a few photos and your power bill, and I'll send you a plan: what to fix first (attic, basement, drafts, windows, doors), rough costs, and the NB rebates you likely qualify for, with a checklist so you don't lose them.
- **Headline:** Fix the cold room first. Plan from $49
- **Description:** Founding spots limited. No payment today.
- **CTA:** Sign up
- **Creative idea:** a short selfie-style video (15–20 s) of you in a basement or attic pointing at a gap or old window, with captions on. Authentic beats polished.
- *Use "$99" in the headline for the p=99 ad sets.*

**FR**
- **Texte principal :** Cette pièce qui gèle chaque hiver ? Je suis rénovateur au Nouveau-Brunswick. Envoyez-moi quelques photos et votre facture d'électricité, et je vous envoie un plan : quoi régler en premier (grenier, sous-sol, courants d'air, fenêtres, portes), les coûts approximatifs et les remises du N.-B. auxquelles vous auriez probablement droit, avec une liste pour ne pas les perdre.
- **Titre :** Réglez la pièce froide d'abord. Plan dès 49 $
- **Description :** Places fondatrices limitées. Aucun paiement aujourd'hui.
- **Bouton :** S'inscrire

---

## Test setup (suggested)

| Item | Suggestion |
|---|---|
| Objective | **Leads** via website conversion (Pixel "Lead" event on form submit). If the Pixel isn't ready, use **Traffic** for the first 3 days. |
| Locations | Radius targeting: **Moncton/Dieppe/Riverview** (25 km), **Fredericton** (25 km), **Saint John** (25 km). Add **Edmundston / Acadian Peninsula** (25 km) for French-only ad sets. |
| Language | EN ad sets: language English. FR ad sets: language French. In Moncton/Dieppe, run both. |
| Age | 30–65+ if allowed. If forced into the Housing category, 18–65+. |
| Placements | Advantage+ placements. Check that the video/creative reads well on Stories and Reels. |
| Structure | 2 ad sets per price (p=49, p=99) × EN/FR = 4 ad sets, each with variants A, B, C. |
| **Budget** | **~$250 CAD total**: about $25/day for 10 days ($6–7/day per ad set). After day 4, pause any ad with link CTR under 0.5% and move its budget to the best ads. |
| Duration | 10 days. Avoid judging results before about 1,000 impressions per ad. |

## Success thresholds (suggested targets, not guarantees)

Context: WordStream by LocaliQ's 2026 benchmarks (Search Engine Land, 14 Sept 2026; mostly US campaigns) report overall Facebook **traffic** campaigns at about **1.93% CTR and $0.60 CPC**, and **lead** campaigns at about **2.70% CTR, $1.80 CPC, 8.54% conversion rate**, with **Home & Home Improvement CPL about $42.95**. A small, new, local advertiser should expect weaker numbers at first. The targets below are deliberately modest.

| Metric | 🟢 Go (strong) | 🟡 Iterate | 🔴 Stop / rethink |
|---|---|---|---|
| Link CTR | ≥ 1.2% | 0.6–1.2% | < 0.6% |
| Cost per link click (CAD) | ≤ $1.00 | $1.00–$2.50 | > $2.50 |
| Landing page → any signup (waitlist or reserve) | ≥ 10% | 4–10% | < 4% |
| Landing page → **"Reserve at founding price"** | ≥ 4% | 1.5–4% | < 1.5% |
| Cost per reservation (CAD) | ≤ $25 | $25–$60 | > $60 |
| Reservations that confirm and pay when emailed (follow-up step) | ≥ 30% | 10–30% | < 10% |

**Read-outs to compare:**
1. **$49 vs $99:** if the reserve rate at $99 is more than half the rate at $49, price higher.
2. **EN vs FR:** compare cost per reservation. A cheaper FR signal supports a French-first moat.
3. **A vs B vs C:** which pain is strongest (confusion, timing, or comfort)? Use the winner's language in interviews and on the homepage.

**Tracking sheet columns:** date · ad set · variant · lang · price · impressions · link clicks · CTR · spend · page views · waitlist · reserves · paid conversions · notes.
