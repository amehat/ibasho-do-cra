# Réconciliation Spine ↔ PRD + Addendum

> Vérification de préservation : chaque exigence source (FR1–FR33, NFR) a-t-elle atterri dans la spine d'architecture, via un AD, une convention, ou la carte capacités→archi ? On signale ce qui manque ou n'est que **implicite** — surtout les règles métier / contraintes / tons discrets que la structure en AD a pu laisser tomber.

**Verdict** : la spine couvre la quasi-totalité des FR/NFR ; aucune capacité majeure n'est perdue. Restent **6 exigences discrètes** seulement implicites (jamais portées par un invariant explicite) et **1 divergence assumée à réconcilier** (PostgreSQL → MariaDB).

Sources comparées :
- Spine : `ARCHITECTURE-SPINE.md`
- PRD : `prd.md`
- Addendum : `addendum.md`

---

## 1. Couverture des exigences fonctionnelles (FR1–FR33)

| FR | Exigence | Couverture spine | État |
| --- | --- | --- | --- |
| FR1 | Organisations presta/client | Map FR1–FR4 → `iam` ; AD-3/10/11 ; ERD ORGANISATION | ✅ Explicite |
| FR2 | ≥ 1 propriétaire d'organisation | `iam` (contexte), ERD MEMBERSHIP | ⚠️ **Implicite** — aucun invariant ne garantit « on ne peut pas retirer/désactiver le dernier propriétaire ». Règle métier non portée. |
| FR3 | Désactiver, jamais supprimer en dur | **AD-11** (explicite, nommé) | ✅ Fort |
| FR4 | Cumul de rôles | Contexte d'acteur `{ userId, orgId, rôles-par-projet }` (AD-10/14) | ✅ Explicite (multi-rôles structurel) |
| FR5 | Créer un projet | Map FR5–FR11 → `projects` ; AD-3 | ✅ Explicite |
| FR6 | Projet = orga presta + cliente + dates | `projects` ; ERD PROJET | ✅ Explicite |
| FR7 | TJM bornés, plages non chevauchantes | **AD-6** (propriété + non-chevauchement explicites) | ✅ Fort |
| FR8 | Périodicité paramétrable par projet | Map → `projects` | ⚠️ **Implicite** — vit dans `projects` mais aucune mention de la périodicité paramétrable ; le défaut mensuel n'apparaît nulle part dans la spine. |
| FR9 | Interface d'invitation qualifiée | Map → `projects` ; ERD INVITATION | ✅ Implicite-suffisant |
| FR10 | Désigner valideur/payeur initiaux | Map → `projects` | ✅ Implicite-suffisant |
| FR11 | Paramétrage modifiable à tout moment | `projects` ; référencé par AD-8 (changement TJM) | ✅ Explicite |
| FR12 | États de jour + fériés pré-marqués forçables | Convention « Jours fériés FR » (`date-holidays`, pré-marqués mais forçables) ; AD-7 | ✅ Fort |
| FR13 | Auto-save brouillon (aucune perte) | Map FR12–FR15 « auto-save » | ⚠️ **Implicite** — cité dans la carte, mais aucun AD/convention ne garantit la sémantique « aucune perte » (débounce, idempotence du save). Détail UX/technique laissé sans contrat. |
| FR14 | Recalcul continu du montant | AD-6, AD-17, AD-8 (recalcul ⇔ non validé) | ✅ Fort |
| FR15 | Soumission bloquée (jour sans TJM / 0 jour) | **AD-7** (explicite, nommé) | ✅ Fort |
| FR16 | Soumission notifie valideur(s) | AD-4/AD-5 (events) ; map `notifications` | ✅ Explicite |
| FR17 | Valider/invalider entier + commentaire obligatoire ; 1re validation gagne | **AD-7** (1re gagne + verrou optimiste) ; machine à états `invalider(commentaire)` | ✅ Fort — *nuance : le caractère **obligatoire** du commentaire d'invalidation est suggéré par la signature mais pas posé comme invariant.* |
| FR18 | Invalidation notifie presta + rouvre édition | AD-7 (transition Soumis→Brouillon) ; AD-4 | ✅ Explicite |
| FR19 | Validé verrouillé/immuable + affiché clairement | **AD-8** + **AD-20** (reflet du statut, bandeau) | ✅ Fort |
| FR33 | Snapshot figé à la validation | **AD-8** (explicite, nommé) | ✅ Fort |
| FR20 | Validation vaut signature horodatée | AD-8 (binds FR20) ; convention horodatage UTC | ✅ Fort |
| FR21 | PDF du CRA validé généré | **AD-16** ; map `documents` | ✅ Fort |
| FR22 | Côté presta, soumission suffit (pas d'étape signature) | Machine à états (pas d'état signature presta) | ✅ Implicite-suffisant |
| FR23 | Dépôt facture si validé + remplacement | **AD-15** (explicite) | ✅ Fort |
| FR24 | Dépôt vaut transmission | **AD-15** | ✅ Fort |
| FR25 | Payeur consulte/télécharge in-app | **AD-16** (jamais d'URL publique) | ✅ Fort |
| FR26 | Le système ne génère pas de facture | **AD-15** + Deferred | ✅ Fort |
| FR27 | Marquer « réglé » (optionnel, paramétrable) | Map → `settlement` ; AD-3/4 | ✅ Implicite-suffisant |
| FR28 | Confirmer réception (optionnel) | `settlement` ; machine à états | ✅ Implicite-suffisant |
| FR29 | Les deux côtés voient l'avancement | `settlement` | ✅ Implicite-suffisant |
| FR30 | Emails d'alerte — **matrice de routage précise** | AD-4/AD-5 + `notifications` (mécanisme) | ⚠️ **Implicite / le plus risqué** — voir §3. |
| FR31 | Tableau de bord « vue rapide » | AD-19/AD-20 ; map `web` ; mantra produit | ✅ Explicite |
| FR32 | Invité crée compte + rattachement auto org+rôle | Map FR32 → `projects` ; ERD INVITATION | ⚠️ **Implicite** — le flux « accepte → crée compte → **rattaché automatiquement** à l'orga+rôle qualifiés » (jointure `iam`↔`projects`, condition d'entrée du client) n'est porté par aucun AD ; partagé entre deux contextes bornés sans règle d'orchestration nommée. |

---

## 2. Couverture des exigences non-fonctionnelles (NFR §7)

| NFR | Couverture spine | État |
| --- | --- | --- |
| Auth email + mot de passe | **AD-14** + convention (argon2id, cookie httpOnly, session MariaDB) | ✅ Fort |
| Sécurité & cloisonnement par rôle/orga | **AD-9** (légalité/autorisation) + **AD-10** (cloisonnement multi-orga) | ✅ Fort |
| « Un membre retiré perd l'accès » | AD-11 (désactivation) | ⚠️ **Implicite** — la désactivation préserve l'audit, mais la spine ne dit pas explicitement que la désactivation **révoque l'accès** (révocation de session active comprise). |
| Traçabilité / journal d'audit | **AD-5** (audit sync, même tx) + AD-11 ; contexte `audit` | ✅ Fort |
| Signature = Option A | AD-8 ; Deferred (eIDAS reporté) | ✅ Fort |
| Documents : génération, stockage, **conservation** | AD-16 ; conservation → Deferred (« à préciser ») | ✅ Cohérent (conservation explicitement différée) |
| Langue française + accents | Convention i18n (FR uniquement v1, `fr-FR`) | ✅ Fort |
| UI/UX : design `prototype-uiux-v2`, statut jamais par couleur seule | Convention Front + **AD-20** (pastille+libellé+icône, jamais couleur seule) | ✅ Fort |
| **Responsive + accessible WCAG AA** | — (seul « jamais la couleur seule » est repris) | ⚠️ **Implicite / partiel** — le responsive et la cible **WCAG AA** ne sont posés par aucune convention ; seul un fragment d'a11y (couleur) survit. |
| **Performance : « vue rapide » quasi instantanée, tunnel sans rupture** | Mantra produit cité (« simple, avec une vue rapide ») | ⚠️ **Implicite** — porté comme intention/mantra, mais aucun budget ni contrainte d'archi (cache, payload, lecture optimisée) ne matérialise la NFR de perf. |
| Contexte technique Nuxt / NestJS / **PostgreSQL** | Stack = MariaDB (driver MikroORM MariaDB) | 🔶 **Divergence assumée** — voir §4. |

---

## 3. Le manque le plus saillant : la matrice de routage des notifications (FR30)

C'est l'exigence discrète typique que la structure en AD a aplatie. Les AD-4/AD-5 garantissent le **mécanisme** (événements de domaine → abonné Notifications après commit, best-effort retriable) et le contexte `notifications` existe. Mais la spine ne porte **nulle part** la **règle métier de destination**, qui est précise et contre-intuitive dans le PRD :

- CRA soumis → valideur(s)
- CRA invalidé → prestataire
- CRA **validé → prestataire UNIQUEMENT** (le payeur voit l'info sur son interface mais **n'est pas notifié**)
- Facture déposée → **payeur UNIQUEMENT**
- « Réglé » → prestataire
- « Réception confirmée » → **payeur + valideur**

Ces asymétries (notamment « validé ⇒ pas de mail au payeur » et « réception ⇒ payeur *et* valideur ») sont une vraie règle métier, source d'erreurs si elle reste dans la tête. Le mécanisme événementiel ne la capture pas : un développeur pourrait câbler les abonnés sans connaître la matrice. **Recommandation** : l'expliciter, soit comme convention dans la spine (table « événement → destinataires »), soit comme contrat du contexte `notifications`.

---

## 4. Divergence assumée — à réconcilier dans l'addendum (pas une erreur)

L'**addendum §Contexte technique** indique **PostgreSQL** ; la spine (Design Paradigm, AD-14, AD-18, Stack, Structural Seed) a basculé sur **MariaDB** (driver MikroORM MariaDB, session persistée en table MariaDB, justifié par l'absence de Redis garanti sur o2switch). 

Le PRD §7 lui-même renvoie le détail BDD à l'addendum (« PostgreSQL — détails dans `addendum.md` »). Il s'agit d'une **décision utilisateur assumée** (hébergement mutualisé o2switch), pas d'une perte d'input. **Action** : mettre à jour l'addendum (et la ligne « Contexte technique » du PRD §7) pour pointer MariaDB et tracer le motif, afin que les artefacts source cessent de se contredire. Aucune correction côté spine.

---

## 5. Synthèse des écarts à traiter

**À expliciter dans la spine (règles/contraintes discrètes seulement implicites) :**
1. **FR30** — matrice de routage des notifications (le plus important).
2. **FR2** — invariant « au moins un propriétaire d'organisation » (interdire la désactivation/retrait du dernier).
3. **FR32** — orchestration « acceptation invitation → création compte → rattachement auto org+rôle » entre `iam` et `projects`.
4. **NFR Accessibilité** — cible WCAG AA + responsive (au-delà de « jamais la couleur seule »).
5. **NFR Performance** — matérialiser la « vue rapide » (budget/contrainte), aujourd'hui seulement un mantra.
6. **FR8 / FR13 / NFR « membre retiré perd l'accès »** — points implicites mineurs (périodicité paramétrable + défaut mensuel ; sémantique « aucune perte » de l'auto-save ; révocation d'accès à la désactivation).

**À réconcilier hors spine :**
- 🔶 PostgreSQL (addendum/PRD) vs MariaDB (spine) — divergence **assumée** ; mettre à jour l'addendum.

Aucune FR/NFR n'est totalement absente : tout est au moins implicitement adressé ; les 6 points ci-dessus gagnent à devenir explicites pour résister à la construction en parallèle.
