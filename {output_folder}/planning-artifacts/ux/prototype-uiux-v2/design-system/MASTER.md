# Design System Master - Suivi CRA (v2)

> Source de vérité globale. Pour une page spécifique, vérifier d'abord `design-system/pages/[page].md` ; sinon appliquer ce fichier.
> Généré via ui-ux-pro-max 2.5.0 (`--design-system --persist`) puis synthétisé vers une direction distinctive.
> v2 : refonte complète du système de boutons (qualité Tailwind UI / shadcn). Le reste de la direction est conservé à l'identique.

**Projet :** Suivi CRA (gestionnaire de CRA, prestataire en direct avec son client)
**Catégorie :** B2B SaaS / dashboard opérationnel + saisie de données
**Langue UI :** Français
**Généré :** 2026-06-29 · **Révisé (v2) :** 2026-06-29

---

## 1. Direction retenue

**Nom : "Bento editorial / Soft Data".**

Croisement de trois pistes remontées par ui-ux-pro-max :
- **Bento Grids** (Apple-style, tuiles modulaires arrondies) pour la "vue rapide" du tableau de bord : chaque KPI est une tuile, lecture immédiate.
- **Swiss Modernism 2.0** (grille stricte, rythme mathématique 8px, accent unique) pour la rigueur du calendrier mensuel et des tableaux.
- **Data-Dense Dashboard** (base ui-ux-pro-max) pour la densité scannable, les chiffres tabulaires et la sobriété pro.

On s'éloigne du template admin générique par : un fond ivoire chaud (pas le gris froid habituel), des cartes blanches à grand rayon, des ombres douces multi-couches, une typo display géométrique (Outfit) et un système de statut sémantique riche (pastille + icône + libellé) qui porte l'identité.

Anti-patterns ui-ux-pro-max respectés : pas de design ornemental, pas d'emoji-icône, transitions 150-250ms, focus visible, contraste AA, pas de scroll horizontal mobile.

---

## 2. Tokens couleur

### Surfaces & encre
| Rôle | Hex | Variable |
|------|-----|----------|
| Canvas (fond page) | `#F4F2ED` | `--canvas` |
| Surface (cartes) | `#FFFFFF` | `--surface` |
| Surface alt (zones douces) | `#FAF9F6` | `--surface-2` |
| Encre primaire (texte) | `#16191F` | `--ink` |
| Encre secondaire | `#565C68` | `--ink-2` |
| Encre tertiaire / muted | `#888E9A` | `--ink-3` |
| Bordure | `#E7E3DB` | `--line` |
| Bordure forte | `#D8D3C8` | `--line-2` |

### Marque & action
| Rôle | Hex | Variable | Contraste |
|------|-----|----------|-----------|
| Sidebar / ink navy | `#14171E` | `--shell` | texte blanc 16:1 |
| Accent / CTA primaire | `#2C5BEF` | `--accent` | blanc 4.7:1 (AA UI/gras) |
| Accent texte (sur clair) | `#1E45C8` | `--accent-ink` | sur blanc 5.9:1 |
| Accent fort (hover) | `#2148C7` | `--accent-strong` | |
| Accent fond doux | `#EAF0FE` | `--accent-soft` | |
| Ring focus | `#2C5BEF` | `--ring` | anneau net 2px + offset 2px |

### Statut CRA (sémantique - cycle complet)
Chaque statut = **pastille couleur + icône + libellé** (jamais la couleur seule).

| Statut | Point | Fond | Texte | Variable préfixe | Icône (Lucide) |
|--------|-------|------|-------|------------------|----------------|
| Brouillon | `#6B7280` | `#F1F0EC` | `#3D424C` | `--st-draft` | pencil |
| En attente / soumis | `#C77A0A` | `#FBF1E2` | `#8A5407` | `--st-pending` | clock |
| Correction demandée / refusé | `#D1392B` | `#FBEBE9` | `#9A211A` | `--st-reject` | rotate-ccw |
| Validé (signé) | `#1C8A4A` | `#E7F4EC` | `#136636` | `--st-valid` | shield-check |
| Facturé | `#5145D8` | `#ECEAFB` | `#3A30A8` | `--st-invoiced` | receipt |
| Réglé / reçu | `#0E9488` | `#E2F3F1` | `#0A6A60` | `--st-paid` | banknote |

### États de jour (calendrier)
| État | Rendu | Repère non-couleur |
|------|-------|--------------------|
| Travaillé | tuile accent-soft, bord accent | tag `J` plein |
| Demi-journée | tuile coupée en diagonale (moitié accent) | tag `½` |
| Non travaillé | tuile blanche neutre | tag `-` |
| Congé | tuile lavande douce + hachures | tag `C` |
| Férié (non travaillé) | tuile pêche douce | tag `F` + libellé férié |
| Férié travaillé | base pêche + anneau accent + badge | tag `F+` |
| Week-end | tuile grisée | libellé gris |

### Feedback
Destructive `#D1392B` / on-destructive `#FFFFFF`. Succès = `--st-valid`. Info = `--accent`.

---

## 3. Typographie

- **Display / titres :** Outfit (500 / 600 / 700) - géométrique, distinctive, moderne.
- **Corps / UI / chiffres :** Inter (400 / 500 / 600) - lisibilité data, `font-feature-settings:"tnum","cv05"`.
- **Chiffres tabulaires** partout (KPI, montants, jours, colonnes) via `.num { font-feature-settings:"tnum"; font-variant-numeric: tabular-nums; }`.

Import :
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
```

Échelle type (px) : 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36. Line-height corps 1.55, titres 1.15.
Labels / eyebrows : Inter 600, 12px, `letter-spacing .06em`, majuscules.

---

## 4. Géométrie, espacement, ombres

Espacement (base 4/8) : `--s-1:4px --s-2:8px --s-3:12px --s-4:16px --s-5:24px --s-6:32px --s-7:48px --s-8:64px`.

Rayons : `--r-card:18px --r-tile:14px --r-control:10px --r-pill:999px`.

Ombres (douces, multi-couches) :
```css
--shadow-sm: 0 1px 2px rgba(20,23,30,.05), 0 1px 1px rgba(20,23,30,.03);
--shadow-md: 0 6px 18px rgba(20,23,30,.07), 0 2px 5px rgba(20,23,30,.04);
--shadow-lg: 0 18px 44px rgba(20,23,30,.13);
```

Container max desktop : 1240px. Sidebar 256px (repliable < 1024px).

---

## 5. Système de boutons (v2 - qualité Tailwind UI / shadcn)

Guidé par ui-ux-pro-max `--domain ux "forms feedback button states loading disabled"` :
focus visible (High), états disabled (opacity + cursor), active (feedback immédiat), hover (web),
loading (feedback async), hover-vs-tap (clic primaire, pas hover seul).

### Anatomie & finitions (toutes variantes)
- **Hauteurs verrouillées** par taille via la variable `--btn-h` : `sm 32px`, `md 40px` (défaut), `lg 48px`.
- **Padding équilibré** : `sm 12px`, `md 16px`, `lg 22px` ; **gap icône/texte** 6 / 8 / 9px.
- **Rayon** cohérent : `sm 8px`, `md 10px`, `lg 12px` (`--btn-radius`).
- **Poids** 600, `letter-spacing -.005em`, libellé sur **une seule ligne** (`white-space:nowrap`).
- **Icônes SVG** : taille verrouillée par `--btn-ico` (15 / 18 / 19px), `flex:0 0 auto` (jamais compressées), alignées au texte par `align-items:center`.
- **Transition** 150ms (couleurs/ombre) + 120ms (transform).

### Variantes
| Variante | Classe | Fond | Bordure | Texte | Usage |
|----------|--------|------|---------|-------|-------|
| Primaire | `.btn--primary` | dégradé bleu vertical (`#3D69F2 -> #2C5BEF -> #2A55E4`) + highlight interne `inset 0 1px 0 rgba(255,255,255,.22)` | aucune | blanc | CTA principal unique par écran (« Nouveau CRA », « Continuer la saisie », « Soumettre le CRA », « Valider le CRA ») |
| Secondaire | `.btn--secondary` | surface blanche | `--line-2` subtile | `--ink` | action secondaire (« Aperçu », « Saisir ») |
| Fantôme | `.btn--ghost` | transparent | aucune | `--ink-2` | actions de liste discrètes (« Voir », « Suivre », « Reçu ») |
| Danger (doux) | `.btn--danger` | surface blanche -> `--st-reject-bg` au hover | `#EFC9C5` -> `--st-reject-dot` | `--st-reject-tx` | action destructive sobre (« Demander une correction ») |
| Danger plein | `.btn--danger-solid` | dégradé rouge | aucune | blanc | destructive forte (réservé si confirmation explicite) |

### États (tous obligatoires)
- **`:hover`** : assombrissement (dégradé plus foncé / fond `--surface-2`) + **élévation `translateY(-1px)`** + ombre renforcée.
- **`:active`** : retour `translateY(0)` + ombre **inset** (effet pression). Équivaut au `scale(0.98)` côté ressenti, sans décaler la mise en page.
- **`:focus-visible`** : anneau net `outline: 2px solid var(--accent)` + `outline-offset: 2px` (le décalage laisse voir le fond -> vrai « ring + ring-offset » quel que soit le support). Danger : offset `--st-reject-dot`.
- **`:disabled`** : `opacity:.5` + `cursor:not-allowed` + suppression ombre/transform (dégradé désactivé, fond aplati).
- **`.is-loading`** : `color:transparent` (libellé masqué) + **spinner inline** centré (`::after`, anneau 2px qui tourne, 0.7s) + `pointer-events:none` + `cursor:progress` + `aria-busy="true"`. Couleur du spinner adaptée par variante.

### Ombres teintées (jamais de noir pur)
- Primaire : `inset 0 1px 0 rgba(255,255,255,.22), 0 1px 2px rgba(18,28,72,.30), 0 2px 6px rgba(44,91,239,.28)`.
- Danger doux : `0 1px 2px rgba(154,33,26,.05)` -> `0 2px 6px rgba(209,57,43,.13)` au hover.

### Bouton icône (`.iconbtn`)
Carré 38px, même langage : hover (ombre douce + bordure renforcée), active (`translateY(1px)` + inset), focus `outline 2px + offset 2px`. Utilisé en topbar et pagination calendrier. Cible >= 38px (>= 44px conseillé sur mobile via padding du conteneur).

### Accessibilité boutons
- Cibles tactiles : md 40px et lg 48px respectent / dépassent le minimum ; `sm 32px` réservé aux actions de tableau sur desktop.
- Anneau de focus jamais supprimé sans remplacement.
- État `loading` annoncé via `aria-busy` + zone `role="status" aria-live="polite"` (message de succès après l'opération).
- Couleur jamais seule : icône + libellé sur les actions sémantiques (danger, primaire).
- `prefers-reduced-motion` : transforms et rotation du spinner neutralisés (le bouton reste lisible en statique).

---

## 6. Autres composants (specs)

- **Carte / tuile bento :** surface blanche, radius 18px, `--shadow-sm`, bord `--line` 1px, hover `--shadow-md`.
- **Pastille statut :** pill radius 999px, point 8px + icône 14px + libellé 13px/600, fond doux + texte sémantique.
- **KPI :** eyebrow (label majuscule) + valeur Outfit 28-36 `.num` + delta/contexte secondaire.
- **Cellule jour :** carré min 44px, tag glyphe coin haut-droit, numéro, focus ring, cible >= 44px ; hover (saisie) ombre + `-1px`, active retour à plat.
- **Champ :** label visible au-dessus, radius 10px, focus bord accent + ring, helper text persistant.
- **Modale/confirm :** scrim `rgba(20,23,30,.45)` + blur 4px, carte radius 18px, `--shadow-lg`.
- **Lien d'action inline (`.linklike`) :** texte accent 600 ; hover -> accent + flèche `translateX(2px)`. Réservé aux liens de navigation (« Tout l'historique »), pas aux actions de ligne (qui passent en `.btn--ghost.btn--sm`).

---

## 7. Mouvement
Transitions 150-250ms ease-out (entrée) / ease-in (sortie). Hover tuiles : ombre + -1px. Boutons : hover -1px, active inset, spinner 0.7s. `prefers-reduced-motion` : neutralise transforms/transitions/animations.

---

## 8. Accessibilité (must)
- Contraste texte >= 4.5:1, glyphes UI >= 3:1.
- Statut jamais par la couleur seule (pastille + icône + libellé ; jours = couleur + tag glyphe).
- Focus visible sur tout élément interactif (anneau 2px + offset boutons/jours, halo 3px liens/champs) ; ordre clavier = ordre visuel.
- Cibles >= 44px (cellules calendrier, boutons md/lg).
- `viewport` zoomable, mobile-first, breakpoints 375 / 768 / 1024 / 1440, pas de scroll horizontal.
- Chiffres en tabular-nums (stabilité des colonnes monétaires).

## 9. Anti-patterns (NE PAS faire)
- Emoji en guise d'icône (SVG inline uniquement).
- Statut signifié par la couleur seule.
- Design ornemental, ombres aléatoires (noir pur), hovers qui décalent la mise en page.
- Texte gris faible contraste, chiffres non tabulaires dans les colonnes.
- Bouton sans état focus/hover/active, libellé sur deux lignes, icône non verrouillée.
- Em-dash / en-dash visibles dans le texte (trait d'union normal seulement).
