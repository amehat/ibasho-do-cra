# Design System — Gestionnaire de CRA (MASTER)

> Source de vérité design pour la v1. Généré avec `ui-ux-pro-max` (tokens, style, typo) puis adapté au produit (outil B2B orienté statut/données). À consommer par `taste-skill` à l'implémentation. Les overrides par page vivent dans `pages/`.

## Direction

- **Type produit :** outil de productivité B2B / dashboard administratif (pas une landing).
- **Style :** Flat design + micro-interactions. Hiérarchie claire, beaucoup de blanc, zéro décoration gratuite.
- **Mantra produit :** « simple, avec une vue rapide ». L'écran doit livrer le **statut** et le **chiffre clé** en moins de 2 secondes.
- **Ton visuel :** sobre, fiable, « administratif premium ». On vend la confiance (argent, signature, juridique), pas le fun.
- **Pattern d'app :** App-shell — sidebar de navigation persistante (desktop) / barre + menu (mobile) + zone de contenu. **Pas** de pattern landing-page.

## Tokens couleur

Palette neutre slate + action bleu de confiance. Le **statut** est porté par des couleurs sémantiques (jamais la couleur seule : toujours doublée d'un libellé + icône).

| Rôle | Hex | Variable CSS |
|------|-----|--------------|
| Background (app) | `#F8FAFC` | `--color-bg` |
| Surface / carte | `#FFFFFF` | `--color-surface` |
| Foreground (texte) | `#0F172A` | `--color-fg` |
| Texte secondaire | `#64748B` | `--color-fg-muted` |
| Muted (fonds doux) | `#E2E8F0` | `--color-muted` |
| Bordure | `#E2E8F0` | `--color-border` |
| **Primary / CTA** | `#2563EB` | `--color-primary` |
| Primary hover | `#1D4ED8` | `--color-primary-hover` |
| On primary | `#FFFFFF` | `--color-on-primary` |
| Sidebar (fond) | `#0F172A` | `--color-sidebar` |
| Sidebar texte | `#CBD5E1` | `--color-sidebar-fg` |
| Sidebar actif | `#FFFFFF` / barre `#2563EB` | `--color-sidebar-active` |
| Focus ring | `#2563EB` | `--color-ring` |

### Couleurs de statut (cycle de vie du CRA)

| Statut | Texte/Icône | Fond pastille | Variable |
|--------|-------------|---------------|----------|
| Brouillon | `#475569` (slate) | `#F1F5F9` | `--status-draft` |
| Soumis / En attente | `#B45309` (amber) | `#FEF3C7` | `--status-pending` |
| Refusé / À corriger | `#DC2626` (red) | `#FEE2E2` | `--status-rejected` |
| Validé | `#15803D` (green) | `#DCFCE7` | `--status-validated` |
| Facturé | `#1D4ED8` (blue) | `#DBEAFE` | `--status-invoiced` |
| Réglé / Reçu | `#0F766E` (teal) | `#CCFBF1` | `--status-paid` |

> Contraste : toutes les paires texte/fond visent AA (≥ 4.5:1). Statut = pastille (libellé) + icône, jamais couleur seule (`color-not-only`).

## Typographie

- **Famille unique :** Plus Jakarta Sans (titres + UI + corps). Poids : 400 / 500 / 600 / 700.
- **Chiffres tabulaires** (`font-variant-numeric: tabular-nums`) obligatoires pour : nombres de jours, TJM, montants, dates — évite le décalage de colonnes (`number-tabular`).
- **Échelle :** 12 / 14 / 16 (base) / 18 / 20 / 24 / 32. Corps 16px mini. Line-height 1.5 corps, 1.2 titres.
- Import : `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`

## Espacement, rayon, ombres

- **Espacement :** échelle 4 / 8 (4 8 12 16 24 32 48). Rythme vertical sections : 24 / 32.
- **Rayon :** `--radius-sm 6px`, `--radius-md 8px` (cartes, inputs, boutons), `--radius-lg 12px` (modales).
- **Ombres :** discrètes et constantes. `--shadow-card: 0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.08)`. Élévation modale plus marquée. Pas d'ombres aléatoires.

## Micro-interactions

- Transitions 150–250ms, `ease-out` à l'entrée. Hover boutons/lignes, états loading (spinner sur bouton async), feedback succès (check + flash vert bref) après validation/soumission.
- `prefers-reduced-motion` respecté. Aucune animation bloquant l'input.

## Icônes

- Set unique : **Lucide** (stroke 1.5–2px, cohérent). Jamais d'emoji. Taille en tokens (16 / 20 / 24).

## Anti-patterns à éviter

- Onboarding complexe — l'app doit être utilisable dès le 1er écran.
- Tables qui débordent sur mobile → scroll horizontal encapsulé ou bascule en cartes.
- Couleur seule pour le statut, placeholder en guise de label, erreurs uniquement en haut de formulaire.
- Décoration (gradients lourds, ombres fortes) qui parasite la lecture des données.

## Accessibilité & responsive (rappels critiques)

- Contraste texte ≥ 4.5:1 ; focus visible partout ; ordre clavier = ordre visuel ; labels visibles + asterisque requis.
- Breakpoints : 375 / 768 / 1024 / 1440. Mobile-first. Sidebar → menu repliable sous 1024px.
- Cibles tactiles ≥ 44px sur les actions (calendrier CRA notamment).
