# Design System Master - Suivi CRA

> Source de verite globale. Pour une page specifique, verifier d'abord `design-system/pages/[page].md` ; sinon appliquer ce fichier.
> Genere via ui-ux-pro-max 2.5.0 (`--design-system --persist`) puis synthetise vers une direction distinctive.

**Projet :** Suivi CRA (gestionnaire de CRA, prestataire en direct avec son client)
**Categorie :** B2B SaaS / dashboard operationnel + saisie de donnees
**Langue UI :** Francais
**Genere :** 2026-06-29

---

## 1. Direction retenue

**Nom : "Bento editorial / Soft Data".**

Croisement de trois pistes remontees par ui-ux-pro-max :
- **Bento Grids** (Apple-style, tuiles modulaires arrondies) pour la "vue rapide" du tableau de bord : chaque KPI est une tuile, lecture immediate.
- **Swiss Modernism 2.0** (grille stricte, rythme mathematique 8px, accent unique) pour la rigueur du calendrier mensuel et des tableaux.
- **Data-Dense Dashboard** (base ui-ux-pro-max) pour la densite scannable, les chiffres tabulaires et la sobriete pro.

On s'eloigne du template admin generique par : un fond ivoire chaud (pas le gris froid habituel), des cartes blanches a grand rayon, des ombres douces multi-couches, une typo display geometrique (Outfit) et un systeme de statut semantique riche (pastille + icone + libelle) qui porte l'identite.

Anti-patterns ui-ux-pro-max respectes : pas de design ornemental, pas d'emoji-icone, transitions 150-250ms, focus visible, contraste AA, pas de scroll horizontal mobile.

---

## 2. Tokens couleur

### Surfaces & encre
| Role | Hex | Variable |
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
| Role | Hex | Variable | Contraste |
|------|-----|----------|-----------|
| Sidebar / ink navy | `#14171E` | `--shell` | texte blanc 16:1 |
| Accent / CTA primaire | `#2C5BEF` | `--accent` | blanc 4.7:1 (AA UI/gras) |
| Accent texte (sur clair) | `#1E45C8` | `--accent-ink` | sur blanc 5.9:1 |
| Accent fond doux | `#EAF0FE` | `--accent-soft` | |
| Ring focus | `#2C5BEF` | `--ring` | halo 3px alpha |

### Statut CRA (semantique - cycle complet)
Chaque statut = **pastille couleur + icone + libelle** (jamais la couleur seule).

| Statut | Point | Fond | Texte | Variable prefixe | Icone (Lucide) |
|--------|-------|------|-------|------------------|----------------|
| Brouillon | `#6B7280` | `#F1F0EC` | `#3D424C` | `--st-draft` | pencil |
| En attente / soumis | `#C77A0A` | `#FBF1E2` | `#8A5407` | `--st-pending` | clock |
| Correction demandee / refuse | `#D1392B` | `#FBEBE9` | `#9A211A` | `--st-reject` | rotate-ccw |
| Valide (signe) | `#1C8A4A` | `#E7F4EC` | `#136636` | `--st-valid` | shield-check |
| Facture | `#5145D8` | `#ECEAFB` | `#3A30A8` | `--st-invoiced` | receipt |
| Regle / recu | `#0E9488` | `#E2F3F1` | `#0A6A60` | `--st-paid` | banknote |

### Etats de jour (calendrier)
| Etat | Rendu | Repere non-couleur |
|------|-------|--------------------|
| Travaille | tuile accent-soft, bord accent | tag `J` plein |
| Demi-journee | tuile coupee en diagonale (moitie accent) | tag `½` |
| Non travaille | tuile blanche neutre | tag `-` |
| Conge | tuile lavande douce + hachures | tag `C` |
| Ferie (non travaille) | tuile peche douce | tag `F` + libelle ferie |
| Ferie travaille | base peche + anneau accent + badge | tag `F+` |
| Week-end | tuile grisee | libelle grise |

### Feedback
Destructive `#D1392B` / on-destructive `#FFFFFF`. Succes = `--st-valid`. Info = `--accent`.

---

## 3. Typographie

- **Display / titres :** Outfit (500 / 600 / 700) - geometrique, distinctive, moderne.
- **Corps / UI / chiffres :** Inter (400 / 500 / 600) - lisibilite data, `font-feature-settings:"tnum","cv05"`.
- **Chiffres tabulaires** partout (KPI, montants, jours, colonnes) via `.num { font-feature-settings:"tnum"; font-variant-numeric: tabular-nums; }`.

Import :
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
```

Echelle type (px) : 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36. Line-height corps 1.55, titres 1.15.
Labels / eyebrows : Inter 600, 12px, `letter-spacing .06em`, majuscules.

---

## 4. Geometrie, espacement, ombres

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

## 5. Composants (specs)

- **Bouton primaire :** fond `--accent`, texte blanc, radius 10px, 600, hover `translateY(-1px)` + ombre, focus ring 3px. Etat loading = spinner + disabled.
- **Bouton secondaire :** surface blanche, bord `--line-2`, texte `--ink`.
- **Bouton danger doux :** texte/bord destructive, fond transparent -> `#FBEBE9` au hover.
- **Carte / tuile bento :** surface blanche, radius 18px, `--shadow-sm`, bord `--line` 1px, hover `--shadow-md`.
- **Pastille statut :** pill radius 999px, point 8px + icone 14px + libelle 13px/600, fond doux + texte semantique.
- **KPI :** eyebrow (label majuscule) + valeur Outfit 28-36 `.num` + delta/contexte secondaire.
- **Cellule jour :** carre min 44px, tag glyphe coin haut-droit, numero, focus ring, cible >= 44px.
- **Champ :** label visible au-dessus, radius 10px, focus bord accent + ring, helper text persistant.
- **Modale/confirm :** scrim `rgba(20,23,30,.45)` + blur 4px, carte radius 18px, `--shadow-lg`.

---

## 6. Mouvement
Transitions 150-250ms ease-out (entree) / ease-in (sortie). Hover tuiles : ombre + -1px. `prefers-reduced-motion` : neutralise transforms/transitions.

---

## 7. Accessibilite (must)
- Contraste texte >= 4.5:1, glyphes UI >= 3:1.
- Statut jamais par la couleur seule (pastille + icone + libelle ; jours = couleur + tag glyphe).
- Focus visible (ring 3px) sur tout element interactif ; ordre clavier = ordre visuel.
- Cibles >= 44px (cellules calendrier, boutons).
- `viewport` zoomable, mobile-first, breakpoints 375 / 768 / 1024 / 1440, pas de scroll horizontal.
- Chiffres en tabular-nums (stabilite des colonnes monetaires).

## 8. Anti-patterns (NE PAS faire)
- Emoji en guise d'icone (SVG inline uniquement).
- Statut signifie par la couleur seule.
- Design ornemental, ombres aleatoires, hovers qui decalent la mise en page.
- Texte gris faible contraste, chiffres non tabulaires dans les colonnes.
- Em-dash / en-dash visibles dans le texte (trait d'union normal seulement).
