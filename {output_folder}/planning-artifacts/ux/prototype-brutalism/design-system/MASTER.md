# Design System — MASTER

**Projet :** Ibasho CRA (gestionnaire de compte rendu d'activité, B2B, prestataire en direct)
**Prototype :** `prototype-brutalism/`
**Direction retenue :** Néo-brutalisme industriel / utilitaire
**Généré via :** skill `ui-ux-pro-max` (`--design-system`, `--domain style/typography/color/ux`)

> Source de vérité globale. Toute page hérite de ce fichier. Une page peut le surcharger via `design-system/pages/<page>.md` (aucune surcharge active pour l'instant).

---

## 1. Parti-pris

Néo-brutalisme assumé mais **discipliné pour un outil financier B2B** : on garde la rigueur brute (bordures noires épaisses, ombres dures décalées sans flou, blocs plats à angles vifs, typo grotesque, labels mono en capitales) et on canalise la couleur vive dans un **système de statut** strict, jamais décoratif. Le « brut » sert la lisibilité et la vue rapide, pas le folklore : pas de rotations gadget sur les données chiffrées, fond papier crème pour réduire la fatigue, contrastes AA garantis.

Sous-direction issue des résultats du skill : **Neo Brutalism** (fond crème, bordures 3-4px, hard offset shadow, mechanical press) croisé avec **Brutalism** (radius 0, capitales mono, grille visible). On écarte le versant « pop-art / stickers / Gen-Z » des résultats au profit d'une variante sobre adaptée à la facturation.

---

## 2. Couleurs (tokens)

Couleur **jamais porteuse d'information seule** : toujours doublée d'une icône SVG + libellé.

| Rôle | Hex | Variable | Usage |
|------|-----|----------|-------|
| Papier (fond) | `#FFFDF5` | `--paper` | Fond global crème + trame légère |
| Bloc crème grisé | `#F4F0E2` | `--paper-2` | Brouillon, week-end, surfaces secondaires |
| Encre (noir) | `#0A0A0A` | `--ink` | Texte, bordures, ombres dures, sidebar |
| Texte secondaire | `#2B2B26` | `--ink-soft` | Méta, helpers |
| Blanc | `#FFFFFF` | `--white` | Cartes, blocs |
| Bleu électrique | `#2D5BFF` | `--blue` | Action primaire / statut « Validé » (texte blanc) |
| Bleu clair | `#DCE4FF` | `--blue-tint` | Remplissage jour « Travaillé » |
| Jaune vif | `#FFD93D` | `--yellow` | Statut « En attente » + férié travaillé (texte encre) |
| Violet | `#6B3FE0` | `--violet` | Statut « Facturé » (texte blanc) |
| Vert | `#00C853` | `--green` | Statut « Réglé » / encaissé (texte encre) |
| Rouge | `#D62828` | `--red` | Refus / correction / danger (texte blanc) |

**Contrastes vérifiés (AA ≥ 4.5:1 texte normal) :** encre/papier, blanc/bleu, encre/jaune, blanc/violet, encre/vert, blanc/rouge.

### Statuts du CRA (cycle de vie)
`Brouillon → En attente → Validé → Facturé → Réglé` (+ `Correction demandée`).
Chaque statut = pastille `.pill` : bloc couleur + bordure noire + ombre dure + **icône** + **libellé en capitales**.

| Statut | Couleur | Icône |
|--------|---------|-------|
| Brouillon | crème grisé | crayon |
| En attente | jaune | horloge |
| Validé | bleu | coche |
| Facturé | violet | document |
| Réglé | vert | coche cerclée |
| Correction demandée | rouge | alerte |

---

## 3. Typographie

- **Affichage / titres / UI :** `Space Grotesk` (700 ; 500 ; 400). Grotesque géométrique, capitales serrées (`letter-spacing: -0.02em`) pour les titres.
- **Chiffres / labels / données :** `JetBrains Mono` (`tabular-nums` partout : jours, TJM, montants, dates). Labels en CAPITALES, `letter-spacing` large (`.12em–.22em`).
- Chargement : Google Fonts, `display=swap`.
- Échelle : 11 (label mono) · 13-15 (corps) · 16 (base) · 19-24 (titres bloc) · 28-44 (H1, `clamp`).
- Base 16px, `line-height` corps 1.5.

```
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
```

---

## 4. Effets & géométrie (signature brutaliste)

- **Radius : 0** partout.
- **Bordures :** `3px` standard, `4px` emphase, toujours `#0A0A0A`.
- **Ombres dures :** offset plein sans flou — `6px 6px 0 #0A0A0A` (blocs), `4px 4px` (petits), `9px 9px` (modale, hover carte).
- **Mechanical press :** au survol, bouton se décale `-2px,-2px` (ombre grandit) ; à l'appui `+4px,+4px` (ombre absorbée). Transitions 80ms linéaires.
- **Trame :** fines lignes de grille en fond (`28px`) pour l'ancrage « papier millimétré ».
- Pas de dégradé mou, pas d'ombre floue, pas de glassmorphism.

---

## 5. Composants clés

- `.block` : carte à bordure 4px + hard shadow, en-tête à fond papier + `.tag` mono.
- `.kpi` : indicateur (icône encadrée colorée + label mono + valeur tabular).
- `.pill` : statut (voir §2).
- `.rail` : frise du cycle de vie (étape `now` en inversé encre/papier).
- `table.calendar` : grille mensuelle, cellule = `.daycell` (numéro mono + état icône+label + valeur jours). Variante `.ro` lecture seule.
- `.btn` : CTA brutaliste (capitales, bordure 4px, mechanical press). `.primary` bleu. Un seul CTA primaire par écran.
- `dialog.modal` : confirmation native `<dialog>` (soumettre, valider, demander correction).
- `.ctx` : en-tête de contexte (validation client), bloc « total » en inversé.

---

## 6. États du calendrier CRA (Mai 2026)

Distinction **forme + motif + icône + libellé**, jamais couleur seule :

| État | Fond | Repère | Valeur |
|------|------|--------|--------|
| Travaillé | bleu clair | coche | 1,0 j |
| Demi-journée | demi-bloc diagonal | moins | 0,5 j |
| Férié travaillé | jaune + liseré noir interne + badge | étoile | 1,0 j |
| Férié chômé | crème grisé | croix | 0 |
| Congé | hachures vertes | feuille | 0 |
| Non travaillé | blanc | — | — |
| Week-end | hachures crème grisé | — | — |

Données du mois : 18 jours pleins + 1 demi-journée (21 mai) = **18,5 j × 550 € = 10 175 €**.
Fériés FR Mai 2026 : 1er Mai (ven, chômé), 8 Mai (ven, travaillé), Ascension (jeu 14, chômé), Pentecôte (lun 25, travaillé).

---

## 7. Accessibilité & responsive

- Contraste AA sur toutes les paires texte/fond.
- `:focus-visible` : contour bleu 4px, offset 3px (jamais supprimé).
- Cibles tactiles ≥ 44px (cellules calendrier, boutons min-height 48px).
- Statut = couleur + icône + texte (`color-not-only`).
- Chiffres en `tabular-nums`.
- Navigation clavier, `aria-label` sur boutons icône, `role="status"` auto-save, `aria-live` motifs.
- `<dialog>` natif (Échap = fermer) pour les confirmations.
- Breakpoints : 375 / 768 / 1024 / 1440. Sidebar repliable < 1024 (menu hamburger, seul JS du prototype). Tables → scroll horizontal.
- `prefers-reduced-motion` : transitions désactivées.

---

## 8. Livrables

```
prototype-brutalism/
├── index.html              (hub des 3 écrans)
├── tableau-de-bord.html    (écran 1 — vue rapide prestataire)
├── saisie-cra.html         (écran 2 — saisie calendrier Mai 2026)
├── validation-client.html  (écran 3 — validation client, lecture seule)
├── styles.css              (CSS partagé, tokens + composants)
└── design-system/MASTER.md (ce fichier)
```

HTML + CSS statiques autoportés, sans build, sans framework. JS minimal inline : menu hamburger + ouverture des `<dialog>`. Icônes SVG inline. Zéro em-dash / en-dash.
