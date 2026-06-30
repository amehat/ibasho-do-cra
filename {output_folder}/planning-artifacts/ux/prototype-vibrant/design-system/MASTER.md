# Design System - MASTER

Projet : **Ibasho CRA** (gestionnaire de compte rendu d'activite, B2B, prestataire independant en direct avec son client).
Direction graphique : **Vibrant & Block-based / Duotone expressif**.
Genere via le skill `ui-ux-pro-max` (passes : `--design-system`, `--domain style "vibrant block-based duotone bold"`, `--domain color`, `--domain typography`, `--domain ux`) puis synthetise et tempere pour un outil de donnees B2B.

> Regle d'or produit : **simple, avec une vue rapide**. Le statut du CRA est l'information la plus visible partout, jamais signale par la couleur seule (toujours pastille + libelle + icone).

---

## 1. Sous-direction retenue et pourquoi

La famille **Vibrant & Block-based / Duotone** (blocs colores audacieux, grandes typos 32px+, contraste eleve, formes geometriques) est appliquee via une sous-direction **"Bloc duotone tempere data"** :

- **Duo signature** Violet electrique x Citron acide pose l'energie et l'identite ; l'encre profonde et un magenta pop completent en triade.
- L'audace passe par les **blocs pleins** (KPI colores alternes), les **bordures epaisses (2,5px)** et les **ombres dures pleines** (offset sans flou, esprit neo-brutaliste maitrise), pas par des couleurs criardes sur les donnees.
- Les **statuts et chiffres** gardent une echelle dediee, accessible AA, pour rester lisibles malgre l'energie chromatique. On assume l'audace sur le decor et les CTA, on protege la lecture des donnees.

## 2. Pattern / layout

- App-shell : **sidebar persistante** (encre profonde, repliable en hamburger < 1024px) + topbar contextuelle (fil d'ariane, statut, notifications).
- Contenu en **blocs** : en-tete de page a grande typo, rangee de KPI colores, blocs cartes a bordure epaisse et ombre dure.
- Grands espaces (gaps 24 / 40px), formes geometriques (mark, pastilles, drapeaux de ferie travaille).

## 3. Palette

| Role | Hex | Usage |
|------|-----|-------|
| Violet electrique (primaire) | `#5A28E6` | CTA, blocs, jour travaille, liens. Blanc dessus = 7,3:1 |
| Citron acide (accent) | `#C9F23A` | Blocs energie, liseres ferie travaille, CTA secondaire. Encre dessus only |
| Encre profonde | `#16131F` | Texte, sidebar, blocs sombres, bordures, ombres |
| Magenta pop (tertiaire) | `#FF2E88` | Decor, avatar, badge. Grands accents only (>= 3:1) |
| Canvas chaud | `#F5F3EC` | Fond d'app (trame de points discrete) |
| Paper | `#FFFFFF` | Surfaces cartes |
| Texte attenue | `#57516B` | Sous-textes |

**Statuts** (texte sur tuile claire >= 4,5:1, toujours + icone + libelle) :

| Statut | Texte | Fond | Icone |
|--------|-------|------|-------|
| Brouillon | `#3F4A5A` | `#E9ECF2` | crayon |
| En attente | `#8A4B05` | `#FCEBC4` | horloge |
| Valide | `#166534` | `#D8F5DF` | check |
| Facture | `#4C1FB3` | `#E7DEFF` | document |
| Regle | `#0B6058` | `#CDF5EE` | check |
| Correction demandee | `#B0211B` | `#FBE0DE` | alerte |

**Etats calendrier** : Travaille = bloc violet ; Demi-journee = bloc coupe en diagonale violet/blanc ; Non travaille = blanc ; Conge = ambre ; Ferie travaille = bloc violet + lisere citron 3px + drapeau ; Ferie chome = pointille attenue ; Week-end = hachures grises.

## 4. Typographie

- **Titres / display / chiffres-cles : Space Grotesk** (geometrique, distinctif, bold). Tailles 32px+ sur les en-tetes (`clamp(32px, 5vw, 50px)`), letter-spacing -0.02em.
- **Corps / UI : Inter** (lisible, neutre). Body 16px, line-height 1.55.
- **Chiffres : `tabular-nums`** systematique (jours, TJM, montants) pour eviter le ballottement.
- Google Fonts, `display=swap`.

## 5. Effets

- Bordures epaisses 2,5px encre ; rayons 8 / 14 / 22px.
- **Ombres dures pleines** : `5px 5px 0 var(--ink)` (cartes), `3px 3px 0` (boutons). Aucun flou.
- Hover : translation -1,5px + ombre agrandie ; active : enfoncement. Transitions 120-200ms.
- `prefers-reduced-motion` : toutes transitions/animations coupees.

## 6. Accessibilite (non negociable)

- Contraste AA verifie sur chaque paire texte/fond malgre les couleurs vives.
- Focus visible 3px (violet, ou citron sur fonds sombres).
- Statut jamais par la couleur seule.
- Cibles tactiles >= 44px (jours de calendrier inclus).
- Skip-link, `aria-current`, `role="status"`/`aria-live` (autosave, erreurs), labels de formulaire, dialogues natifs avec message obligatoire pour la demande de correction.
- Responsive 375 / 768 / 1024 / 1440 ; sidebar repliable ; tables en scroll horizontal sur mobile.
- **Zero em-dash / en-dash** dans toute l'UI.

## 7. Fichiers

- `index.html` - sommaire du prototype (3 ecrans + palette).
- `tableau-de-bord.html` - vue rapide prestataire (KPI + CRA recents).
- `saisie-cra.html` - grille calendrier Mai 2026, synthese, soumission.
- `validation-client.html` - calendrier lecture seule, contexte, valider / demander une correction.
- `styles.css` - design system complet (tokens, blocs, statuts, calendrier, dialogues, responsive).
- `app.js` - JS minimal (menu mobile + dialogues natifs).

## 8. Donnees de demonstration

Mission "Refonte SI", client "Groupe Vauban", prestataire "Arnaud Mehat", TJM 550 &euro;.
Mai 2026 : 18 jours pleins + 1 demi-journee = **18,5 j** ; montant = 18,5 x 550 = **10 175 &euro;**.
Feries FR : 1er Mai (ven) chome, 8 Mai (ven) travaille, Ascension (jeu 14) chome, lundi de Pentecote (lun 25) travaille.

## Anti-patterns a eviter

- Retomber sur un dashboard neutre gris/navy sans audace chromatique.
- Couleurs neon directement sur les donnees ou les statuts (illisible).
- Statut par la couleur seule.
- Em-dash / en-dash visibles.
- Emoji en guise d'icone (icones SVG inline only).
