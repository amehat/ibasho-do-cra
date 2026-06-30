# Design System MASTER — Gestionnaire de CRA

Style de référence : **Neumorphism / Soft UI Evolution**. Surfaces extrudées douces, ombres
internes/externes jumelles, base clay monochrome, profondeur discrète, très tactile. Contraste
volontairement remonté au-dessus du neumorphism « pur » pour atteindre WCAG AA (point faible
historique du style, traité ici en priorité).

Source : ui-ux-pro-max 2.5.0 (`--design-system`, `--domain style "neumorphism soft UI"`,
`--domain typography`, `--domain color`, `--domain ux`).

---

## 1. Parti-pris (sous-direction retenue)

- **Soft UI Evolution sur base claire** (clay froid), pas de neumorphism pastel basse-contraste.
- Le matériau est unique : tout (cartes, boutons, cellules) est extrudé du même fond clay.
  L'information vient de la **lumière** (convexe = actionnable/saillant, concave/inset = champ,
  pressé ou « creux »), pas de bordures dures.
- **Monochrome + un seul accent** indigo. La couleur ne porte jamais seule une information :
  toujours doublée d'une icône SVG et d'un libellé (exigence statut + WCAG `color-not-only`).
- Calme, posé, B2B. Animations sobres 180–260 ms, `prefers-reduced-motion` respecté.

## 2. Couleurs (tokens)

| Rôle | Hex | Variable |
|------|-----|----------|
| Fond clay (matériau) | `#E4E9F1` | `--clay` |
| Surface haute (KPI) | `#E8EDF4` | `--clay-raised` |
| Creux / inset | `#DCE3ED` | `--clay-sunken` |
| Ombre claire (lumière haut-gauche) | `rgba(255,255,255,0.92)` | `--shadow-light` |
| Ombre froide (bas-droite) | `rgba(163,177,198,0.55)` | `--shadow-dark` |
| Texte principal | `#1E2A40` | `--text` |
| Texte fort / titres | `#0F172A` | `--text-strong` |
| Texte secondaire | `#46566F` | `--muted` (≥ 4.5:1 sur clay) |
| Accent (CTA primaire) | `#4F46E5` | `--accent` |
| Accent pressé | `#4338CA` | `--accent-press` |
| Sur accent | `#FFFFFF` | `--on-accent` |
| Anneau focus | `#4F46E5` | `--ring` |

**Statuts** (pastille = pastille teintée + icône + libellé, texte foncé AA) :

| Statut | Texte | Fond pastille | Variable |
|--------|-------|---------------|----------|
| Brouillon | `#475569` | `#D7DEEA` | `--st-draft` |
| En attente | `#8A5206` | `#FAE7CC` | `--st-wait` |
| Validé | `#15692F` | `#D3E8DB` | `--st-valid` |
| Facturé | `#1D4ED8` | `#D6E1F6` | `--st-billed` |
| Réglé / encaissé | `#0C6B61` | `#CBE8E4` | `--st-paid` |

**Cellules calendrier** : Travaillé = accent indigo · Demi-journée = indigo « ½ » · Non
travaillé = clay neutre inset · Week-end = clay grisé inset · Férié chômé = clay grisé + icône
calendrier · Férié travaillé = travaillé + **liseré indigo en pointillés** (le cas distinctif).
Chaque état porte une icône + un libellé, jamais la couleur seule.

## 3. Typographie

- **Plus Jakarta Sans** (famille unique, Google Fonts) — recommandation B2B/SaaS du skill.
- Échelle : 12 · 13 · 14 · 16 (base) · 18 · 22 · 28 · 34. Line-height corps 1.55.
- Poids : 400 corps · 500 labels · 600 titres de carte/boutons · 700 titres d'écran.
- **`tabular-nums`** sur tous les chiffres (jours, TJM, montants) pour éviter le ballotage.

## 4. Effets (matériau Soft UI)

```
--e-raised : -6px -6px 12px var(--shadow-light), 6px 6px 14px var(--shadow-dark);
--e-raised-sm : -3px -3px 7px var(--shadow-light), 4px 4px 9px var(--shadow-dark);
--e-inset : inset -3px -3px 6px var(--shadow-light), inset 3px 3px 7px var(--shadow-dark);
--e-press : inset -2px -2px 5px var(--shadow-light), inset 3px 3px 7px var(--shadow-dark);
```

- Rayons : cartes 20px · boutons/cellules 14px · pastilles 999px.
- États : repos = convexe ; survol = lift léger (ombre + 1px) ; pressé = inset ;
  champ de saisie = inset permanent (`read-only-distinction`).
- **Focus visible renforcé** : `outline: 3px solid var(--ring); outline-offset: 3px;`
  jamais retiré (compense la faible démarcation native du neumorphism).

## 5. Layout & accessibilité

- Shell : sidebar persistante ≥ 1024px, repliable en hamburger en dessous (seul JS du proto).
- Breakpoints 375 / 768 / 1024 / 1440. Tables → cartes empilées sur mobile.
- Cibles ≥ 44px (cellules calendrier comprises). Ordre clavier = ordre visuel.
- Contraste corps ≥ 4.5:1, glyphes/icônes ≥ 3:1. Statut jamais par couleur seule.
- Confirmations avant action verrouillante (soumettre / valider) ; message obligatoire pour
  « demander une correction ». Auto-enregistrement brouillon signalé discrètement.
- **Zéro em-dash / en-dash** dans l'UI.

## 6. À éviter

- Neumorphism « pur » basse-contraste (gris sur gris), pastels lavés.
- Dashboard plat générique : bordures dures, ombres Material plates, cartes sans matériau.
- Couleur comme seul porteur de statut. Emoji en guise d'icône. Dark mode par défaut.
