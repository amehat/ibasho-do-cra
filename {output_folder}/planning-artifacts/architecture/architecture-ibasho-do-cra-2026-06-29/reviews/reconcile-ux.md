# Réconciliation Spine ↔ UX ↔ Brief

> Revue de cohérence de `ARCHITECTURE-SPINE.md` contre `ux/ux-design.md`, `ux/design-system/MASTER.md` et `briefs/.../brief.md`.
> Date : 2026-06-29 · Statut spine : draft · Statut UX : draft · Statut brief : ready

**Verdict :** la spine est globalement fidèle au brief et au PRD ; elle a correctement tranché l'immuabilité. Deux corrections à porter **côté UX** (déverrouillage admin, référence design system obsolète) et **un trou réel de la spine** (notifications in-app / cloche), plus une précision à apporter sur l'auto-save.

---

## 1. Déverrouillage admin d'un CRA validé — divergence UX, PAS un trou de spine ✅

**Statut : divergence connue, à corriger côté UX. La spine a raison.**

La spine (AD-8) pose l'immuabilité absolue : *« Aucune méthode de déverrouillage/réouverture n'existe sur un CRA validé — l'absence de la méthode* est *la garantie (pas même pour l'admin). »* C'est aligné mot pour mot avec le **brief**, qui le dit à trois endroits :
- §La solution : « Un CRA validé est **définitivement immuable** : personne ne le déverrouille, pas même l'admin. »
- §Pour qui : l'admin « ne peut **pas** modifier la validation d'un CRA ».
- §Périmètre : « Un CRA validé reste immuable en toutes circonstances. »

Le **doc UX (draft)** est le seul artefact à porter encore le concept inverse, à trois endroits :
- Tableau navigation Admin : « + accès **déverrouillage d'un CRA validé** » (ligne 28).
- Écran 4 : mention « Une correction nécessite l'intervention d'un administrateur (chemin admin) » (ligne 77).
- Hors périmètre v1 : « déverrouillage admin **avancé** » — formulation qui sous-entend qu'une version simple existerait en v1 (ligne 120).

**Conclusion :** brief + PRD + spine concordent sur l'immuabilité ; l'UX est l'outlier qui traîne un concept périmé. **À corriger dans `ux-design.md`**, pas dans la spine :
- Retirer l'item de nav Admin « déverrouillage d'un CRA validé ».
- Écran 4 : remplacer « Une correction nécessite l'intervention d'un administrateur » par la règle réelle (immuable ; seule correction aval = remplacer la facture tant que le règlement n'est pas confirmé, cf. AD-15).
- Hors périmètre : supprimer « déverrouillage admin avancé » (n'existera jamais, ce n'est pas un « plus tard »).

---

## 2. Auto-save brouillon (FR13) — principe couvert, chemin pas explicité ⚠️

**Statut : partiellement prévu. Le principe est là ; le use-case n'est pas nommé.**

Ce que la spine couvre déjà :
- **Route BFF** : AD-19 impose que tout accès données front passe par les server routes Nuxt/Nitro (`useFetch`/`$fetch`). Le chemin de transport de l'auto-save est donc cadré par principe.
- **Recalcul** : AD-8 précise que le recalcul continu (FR14) ne s'applique qu'aux CRA non validés — l'édition au fil de l'eau est donc reconnue.
- FR13 figure bien dans `binds`.

Ce que la spine **ne nomme pas** :
- **Aucun use-case d'édition/sauvegarde de brouillon.** AD-7 énumère uniquement les transitions `soumettre` / `valider` / `invalider`. La machine à états (Structural Seed) n'a **pas de self-transition `Brouillon → Brouillon`** pour l'édition des lignes-jours. L'écriture de l'auto-save est donc implicite, jamais carvée.
- **La nature haute-fréquence de l'auto-save** (l'UX dit « à chaque changement », avec peinture multi-jours) a une valeur archi : débounce côté front, sémantique de sauvegarde partielle, et surtout **concurrence sur l'agrégat Brouillon**. La spine n'utilise le verrou optimiste (version de l'agrégat) que pour la validation multi-valideurs (AD-7) — il faudrait clarifier qu'un auto-save écrit aussi cette version, ou décider que le brouillon n'est édité que par le prestataire propriétaire (pas de concurrence) et l'écrire.

**Recommandation :** ajouter une ligne à AD-7 (méthode d'agrégat type `modifierJournée`/`enregistrerBrouillon`, légale seulement à l'état Brouillon/Refusé) et une self-transition sur la machine à états. C'est à la frontière de l'altitude « spine », mais FR13 est bindé : une mention d'une phrase suffit.

---

## 3. Exigences transverses UX → lesquelles ont une valeur archi

| Exigence UX transverse | Valeur archi ? | Couverture spine |
|---|---|---|
| **Statut jamais par couleur seule** | **OUI** — impose que le statut soit un **enum stable côté back**, mappé par le front en (libellé + icône + pastille). Ce n'est pas du CSS : c'est un contrat de données. | ✅ **Capturée** — AD-20 (« pastille + libellé + icône, jamais la couleur seule », statut = source de vérité back) + convention enveloppe d'erreur « code stable (enum) mappé par l'UI, jamais de parsing de texte ». |
| **tabular-nums / montants** | **OUI** — l'affichage tabulaire n'a de sens que si les montants sont exacts ; impose entiers-centimes / `Money` VO et format `fr-FR`. | ✅ **Capturée** — AD-17 (jamais de flottant, `Money`, `fr-FR` + `tabular-nums`). |
| **WCAG AA (contraste, focus, ordre clavier)** | Non — purement front/CSS/markup. | n/a (correctement laissé au front). |
| **Responsive (375/768/1024/1440, tables→cartes)** | Non — purement front/CSS. | n/a. |
| **`prefers-reduced-motion`, transitions 150–250ms** | Non — purement front/CSS. | n/a. |
| **URL = état / deep-linking** (nav UX) | Marginal — routing Nuxt/SSR, pas une décision d'invariant. | Implicitement couvert par la stack Nuxt. |

**Synthèse :** les deux seules exigences transverses à réelle valeur architecturale (statut = enum back, montants exacts) **sont bien capturées** par la spine. Les autres sont à juste titre front-only. Pas de trou de ce côté.

---

## 4. Trou réel de la spine : notifications **in-app** (cloche) 🔴

**Statut : contrainte UX implicite à valeur archi que la spine a laissée tomber.**

L'UX (Topbar, ligne 30) prévoit pour **tous les rôles** une **« cloche de notifications (miroir des alertes mail) »**, et la cloche est aussi listée dans l'app-shell. Une cloche in-app n'est pas du « best-effort email » : elle implique des notifications **persistées, par utilisateur, requêtables** (lues/non lues), donc :
- un **read-model de notifications** (stockage en table),
- un **endpoint de lecture** exposé au front via le BFF (liste + compteur non-lus + marquage lu).

Or la spine décrit le contexte **Notifications uniquement comme « abonné événements → Brevo (après commit), best-effort retriable »** (AD-4, AD-5, Capability Map, Structural Seed). C'est un canal **email fire-and-forget** : rien n'est persisté ni requêtable pour alimenter une cloche. **Le besoin in-app n'est carvé nulle part.**

**Impact :** sans décision, l'implémentation soit invente un store ad hoc (viole AD-3 si un autre contexte le lit), soit la cloche reste vide. À trancher au niveau spine :
- soit Notifications possède **deux adapters out** sur le même flux d'événements (Brevo + persistance in-app) et **expose un port de lecture** ;
- soit la cloche est explicitement **déférée en v1** (et l'UX retire la cloche du périmètre v1).

C'est le point le plus structurant de cette revue : un principe UX (« la cloche est le miroir in-app des alertes mail ») a une implication archi directe non résolue.

---

## 5. Incohérence de référence design 🔴

**Statut : la spine ET le doc UX référencent le mauvais design system.**

Deux fichiers `MASTER.md` coexistent et décrivent **deux directions différentes** :

| | `ux/design-system/MASTER.md` (référencé par la spine + l'UX) | `ux/prototype-uiux-v2/design-system/MASTER.md` (direction **validée**) |
|---|---|---|
| Identité | « Flat design B2B », générique admin | « Bento editorial / Soft Data » (v2, refonte) |
| Canvas | `#F8FAFC` (gris **froid** slate) | `#F4F2ED` (**ivoire** chaud) |
| Typo | Plus Jakarta Sans (famille unique) | **Inter** (corps) + **Outfit** (display) |
| Accent | `#2563EB` | `#2C5BEF` |
| Sidebar | `--color-sidebar #0F172A` | `--shell #14171E` |

La **direction design validée est `prototype-uiux-v2` (ivoire éditorial)** — confirmé par le prototype lui-même (`app.css` : `--canvas:#F4F2ED`, Inter+Outfit) et son propre MASTER (« On s'éloigne du template admin générique par : un fond ivoire chaud (pas le gris froid habituel)… typo display Outfit »).

Or :
- La **spine** (Consistency Conventions → Front, et Capability Map) écrit : *« design system `prototype-uiux-v2` / `ux/design-system/MASTER.md` »* — elle **nomme** uiux-v2 mais **pointe le chemin du MASTER slate obsolète**. Conflation d'un nom validé et d'un chemin périmé.
- Le **doc UX** s'ancre lui aussi sur le mauvais : ligne 10 « S'appuie sur `design-system/MASTER.md` », et tout son vocabulaire de tokens (`--color-sidebar`, « barre bleue », pastilles slate) vient de la version slate, pas de l'ivoire uiux-v2 (`--canvas`, `--shell`, `--accent`).

**Portée :** majoritairement front/CSS (les tokens ne changent pas l'archi), **mais la référence est la source de vérité que `taste-skill` consommera à l'implémentation.** Si on ne corrige pas, l'app sera construite en slate générique alors que la direction validée est l'ivoire éditorial.

**Correction (références uniquement) :**
- Spine : remplacer le chemin `ux/design-system/MASTER.md` par **`ux/prototype-uiux-v2/design-system/MASTER.md`** dans les `sources`, la convention Front et la Capability Map.
- UX : ré-ancrer `ux-design.md` sur le MASTER uiux-v2 (tokens `--canvas`/`--shell`/`--accent`, Inter+Outfit) et, idéalement, archiver/supprimer le `ux/design-system/MASTER.md` slate pour éliminer l'ambiguïté.

---

## Récapitulatif des actions

| # | Sujet | Côté à corriger | Sévérité |
|---|---|---|---|
| 1 | Déverrouillage admin (3 mentions UX) | **UX** — aligner sur immuabilité (la spine a raison) | Moyenne (divergence connue) |
| 2 | Auto-save FR13 : use-case + self-transition Brouillon + concurrence | **Spine** — préciser (1 ligne dans AD-7 + machine à états) | Faible |
| 3 | Transverses UX→archi (statut enum, montants) | — déjà capturées (AD-20, AD-17) | OK |
| 4 | **Notifications in-app / cloche** non carvées (contexte Notifications = email only) | **Spine** — trancher (persistance + port de lecture, ou défer + retirer la cloche UX) | **Élevée** |
| 5 | Référence design : spine + UX pointent le MASTER slate au lieu de l'ivoire uiux-v2 validé | **Spine + UX** — corriger le chemin | **Élevée** (source de vérité d'implémentation) |
