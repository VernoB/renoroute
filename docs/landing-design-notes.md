# Notes de design — landing page v2 (19 oct. 2026)

But : passer d'une page « gabarit » à une page de niveau agence (retour de Brown), sans casser la cohérence avec l'app, l'accessibilité ni la performance. Aucun élément graphique n'a été copié : seuls des **patterns** ont été retenus. Toutes les illustrations sont des SVG originaux faits main.

## Références étudiées (pages consultées le 19 oct. 2026)
| Site | URL | Patterns retenus |
|---|---|---|
| Enter (DE) | https://www.enter.de/ | Parcours en 4 étapes (conseil → analyse → installation/subventions → validation), bloc « chiffres qui parlent » avec gros compteurs, FAQ longue et rassurante, preuve « experts certifiés » |
| Octopus Energy (UK) | https://octopus.energy/ | Ton chaleureux et direct, CTA unique et répété, cartes produit très lisibles, preuve sociale massive (on garde l'emplacement, **sans faux avis**) |
| Quilt (US) | https://www.quilt.com/ | Esthétique produit premium : beaucoup d'espace, typographie display, visuel produit qui « vit », bénéfices courts en 3 colonnes |
| Sealed (US) | https://www.sealed.com/ | Positionnement « experts des remises », message « on s'occupe des formulaires et des calculs », mise en avant des remises comme bénéfice principal |
| Aira (UK/EU) | https://www.airahome.com/ | Climate-tech grand public : fonds clairs/sombres alternés, accent couleur unique, sobriété |
| Rewiring America (US) | https://www.rewiringamerica.org/ | Pédagogie « pourquoi électrifier », ton civique, accessibilité du langage |

## Décisions de design
- **Structure** : héros scénarisé → bandeau défilant → problème (timeline des programmes) → comment ça marche (séquence épinglée) → aperçu de l'app (téléphone animé) → chiffres clés (compteurs) → confiance (fondateur + emplacements réservés) → prix → FAQ → CTA final + formulaire → pied de page avec avis légal.
- **Héros** : maison SVG qui « se rénove » au défilement (courants d'air qui disparaissent, isolation du grenier, fenêtres qui s'allument, fumée de mazout qui s'arrête, thermopompe qui arrive, compteur de remises). Le compteur est étiqueté **« Exemple illustratif »** (pas une promesse).
- **Chiffres** : seulement les montants déjà dans `docs/03-database.md` §8 (99 $ + TVH, 9 mois, 400 $, 1 500 $, 50 $, 250–550 $, jusqu'à 10 000 $ fédéral **annoncé**), avec source et date. Rien d'inventé ; les montants du téléphone sont marqués « Exemple ».
- **Preuve sociale** : emplacements **clairement marqués « Espace réservé »**, aucun témoignage fictif.
- **Palette/typo v2** (voir `04-ui-ux.md` §5) : on garde les couleurs de base de l'app ; on ajoute forêt/sable/menthe pour les sections sombres et chaudes, et **Bricolage Grotesque** pour les titres (Inter reste le texte courant). Grain léger, verre dépoli (glassmorphism) seulement sur les HUD et l'en-tête.
- **Motion** : GSAP 3.15 + ScrollTrigger auto-hébergés (`assets/vendor/`, licence standard sans frais de GSAP). Pas de Lenis (inutile pour la perf et le respect du défilement natif). Tout passe par `gsap.matchMedia()` : avec `prefers-reduced-motion: reduce`, la page est statique et complète. Transforms et opacité seulement ; boucles mises en pause hors écran ; épinglage seulement sur desktop ≥ 960 px.
- **Micro-interactions** : boutons « magnétiques » (pointeur fin seulement, `gsap.quickTo`), remplissage au survol, flèche qui glisse, focus visible 3 px, champs avec halo de focus, accordéon FAQ accessible (`aria-expanded`/`aria-controls`).

## Mesures (Lighthouse 12, profil mobile simulé, serveur local)
| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| index.html | 91 | 100 | 100 | 100 | 3.2 s | 60 ms | 0 |
| privacy.html | 100 | 100 | 100 | 54* | 1.5 s | 0 ms | 0 |
\* `noindex` volontaire sur la page de confidentialité (brouillon).
À re-mesurer une fois en ligne (GitHub Pages + CDN de polices).
