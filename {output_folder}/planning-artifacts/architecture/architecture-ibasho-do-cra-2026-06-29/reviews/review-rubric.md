---
title: "Revue d'architecture — ARCHITECTURE-SPINE.md (good-spine checklist)"
target: "architecture-ibasho-do-cra-2026-06-29/ARCHITECTURE-SPINE.md"
reviewer: "Relecteur d'architecture"
date: "2026-06-29"
altitude: initiative
---

# Revue — Gestionnaire de CRA, Architecture Spine

## Verdict

Spine **solide et inhabituellement rigoureuse sur les invariants de domaine** (machine à états, immuabilité, propriété du TJM, cloisonnement multi-orga, anti-flottant) ; les principaux trous sont dans **l'enveloppe opérationnelle** (sauvegardes/DR de données à valeur probante, observabilité, secrets) et dans quelques **invariants non outillés** (hexagonal « strict » sans garde CI) et **ambiguïtés de contrat** (représentation des montants, conventions de liste). Aucun trou *critique* bloquant, mais deux findings *hauts* à corriger avant de descendre d'un cran.

---

## Évaluation point par point de la checklist

### 1. La spine fixe-t-elle les VRAIS points de divergence, sans en manquer ?

Largement oui. Les vrais axes de divergence front↔back↔schéma sont couverts : topologie BFF (AD-1, AD-19), direction des dépendances (AD-2), étanchéité des contextes (AD-3), communication par événements (AD-4), garantie de livraison Audit vs Notifications (AD-5), propriété du TJM (AD-6), machine à états et immuabilité (AD-7, AD-8), légalité vs autorisation (AD-9), scoping multi-orga (AD-10), contrat API anti-drift (AD-12), double validation (AD-13), frontière de confiance (AD-14), montants (AD-17).

**Manques** (détaillés en findings) : représentation canonique des montants laissée au choix (F4), conventions de liste/pagination absentes pour les tableaux de bord (F6), validation des fichiers déposés (F5).

### 2. Chaque Rule est-elle APPLICABLE (enforceable) et empêche-t-elle la divergence de « Prevents » ?

Mitigé. Les règles *mécanisables* sont bien posées : AD-12 nomme la tâche Turborepo de génération du client (vraiment anti-drift), AD-7 nomme le verrou optimiste, AD-18 sort les migrations du boot. **Mais les invariants structurels les plus importants (AD-2 hexagonal strict, AD-3 contextes étanches, AD-1/AD-19 accès via BFF) sont énoncés en prose sans garde automatique nommée** : sans lint de frontières en CI, « strict » se dégrade au premier raccourci. Voir F3.

### 3. Rien sous « Deferred » ne laisse-t-il deux unités diverger ?

Correct dans l'ensemble. Les éléments déférés sont soit de l'enveloppe ops (isolation réseau, staging), soit des features v2 (rôle intermédiaire/marge, module contrat, dashboards pluriannuels), soit des durcissements (eIDAS, MikroORM v7) — aucun ne laisse deux unités v1 diverger structurellement. **Réserve** : « Politique de conservation des documents — à préciser » est déféré sans signaler qu'elle **entre en tension avec AD-11 (jamais de suppression dure) et le RGPD** (droit à l'effacement). Ce n'est pas une divergence inter-unités mais un trou de politique qui touche le modèle de données. Voir F5(d).

### 4. Technos nommées vérifiées-courantes (juin 2026) ?

Oui, vérifié par recherche web le 2026-06-29 :
- **Nuxt 4.4.x** — courant ; 4.4 est sorti le 2026-03-12, dernier patch ~4.4.4. ✓
- **NestJS 11.1.x** — courant ; v11 active. ✓
- **MikroORM 6.6.x, « v7 disponible, écartée pour stabilité »** — **exact** : MikroORM v7 est désormais GA en 2026 (zéro dépendance runtime, ESM natif). Choisir v6.6 pour la stabilité v1 est une décision défendable et correctement étiquetée. ✓
- **Turborepo 2.10.x, TS 5.x, Node 22 LTS, MariaDB ≥10.6, pdfmake 0.2.x, `@getbrevo/brevo`, argon2id** — plausibles et cohérents avec l'hébergement o2switch. ✓

Aucun finding de version. Recommandation mineure : confirmer les patchs exacts au moment de l'`install` (lockfile) plutôt que de figer des `.x` dans la prose.

### 5. Couvre-t-elle FR1–FR33 ?

Oui — les 33 FR sont tracés. Vérification croisée avec le PRD :
- FR1–FR4 → `iam` (AD-3, AD-10, AD-11) ✓
- FR5–FR11, FR32 → `projects` (AD-3, AD-6) ✓
- FR12–FR15 → `cra` + `web` (AD-7, AD-6, AD-17, AD-20) ✓
- FR16–FR22, FR33 → `cra` (AD-7, AD-8, AD-9, AD-5) ✓
- FR23–FR26 → `invoicing` + `documents` (AD-15, AD-16) ✓
- FR27–FR29 → `settlement` (AD-3, AD-4) ✓
- FR30 → `notifications` (AD-4, AD-5) ✓
- FR31 → `web` (AD-19, AD-20) ✓
- FR21/FR25 (PDF) → `documents` (AD-16) ✓

NFR (auth, traçabilité, sécurité) référencés dans AD-14, AD-11, AD-5, AD-10. Pas de FR orphelin.

### 6. Chaque dimension de l'altitude « initiative » est-elle décidée/déférée/ouverte ?

C'est **ici que se concentrent les manques**. Tour des dimensions :
- Paradigme, contextes, contrats, domaine, données, sécurité d'accès, montants → **décidés**. ✓
- Déploiement (AD-18 + CI/CD GitHub Actions→SSH/rsync + topologie Passenger) → **décidé**. ✓
- Environnements (local+prod, staging déféré) → **décidé/déféré**. ✓
- Infra/provider (o2switch) → **décidé**. ✓
- **Sauvegardes / reprise après sinistre (DR) → SILENCE total.** Données à valeur probante (CRA validés, PDF, factures) sur un disque mutualisé unique + une BDD unique, sans stratégie de backup ni de restauration. **Dimension entière muette = finding (F1, haut).**
- **Observabilité / logs / monitoring d'erreurs → SILENCE.** Aucune convention de logging, corrélation, ni alerte d'échec. (F5, moyen.)
- **Gestion des secrets** (secret JWT partagé, clé Brevo, creds BDD) sur o2switch → **non adressé**. (F5, moyen.)
- **Durcissement auth** (rate-limit/anti-bruteforce login, expiration/rotation de session) → **non adressé**. (F5, moyen.)

---

## Findings

### F1 — [HAUT] Aucune stratégie de sauvegarde/DR pour des données à valeur probante
**Où :** Stack / Structural Seed / Deferred — dimension ops absente.
**Pourquoi :** Les CRA validés, leurs PDF figés et les factures portent une **valeur probante juridique** (FR19–FR21, AD-8, AD-16) et sont stockés sur **un seul disque o2switch mutualisé + une seule MariaDB**, sans aucune mention de sauvegarde, de rétention de backup, ni de procédure de restauration. Pour une altitude *initiative* avec engagement signé, c'est la dimension la plus risquée laissée silencieuse. Un incident disque = perte d'engagements signés irrécupérables.
**Correctif :** Ajouter un AD ops, p. ex. *« AD — Durabilité des artefacts probants : dump MariaDB automatisé + sauvegarde du disque hors-webroot, copiés hors-serveur (rétention ≥ durée légale), restauration testée. »* À défaut d'implémentation v1, l'inscrire en **question ouverte explicite**, pas en silence. Articuler avec la « politique de conservation » déjà déférée (F5d).

### F2 — [HAUT] Notifications « après commit, best-effort » sans outbox durable = transmission silencieusement perdue
**Où :** AD-5, AD-15.
**Pourquoi :** AD-5 dispatche les notifications **après commit, en best-effort retriable**, sur un **bus in-process**. Or AD-15 pose **« dépôt = transmission = payeur notifié »** : l'email *est* le signal de transmission. Sous Passenger (process recyclés/multiples), un retry purement in-process est perdu au recyclage ou au crash → le payeur n'est **jamais** notifié alors que l'état métier dit « transmis ». Le « retriable » n'a aucun support de persistance nommé.
**Correctif :** Introduire un **outbox transactionnel** : persister l'intention de notification dans la **même UoW** que le changement d'état (table `outbox`), drainée par un worker/cron qui appelle Brevo et marque l'envoi. Rend les notifications re-dérivables et idempotentes à travers les redémarrages. (Cohérent avec le style AD-5 ; Audit y est déjà same-tx, l'outbox étend la même garantie au signal de transmission.)

### F3 — [MOYEN] Invariants structurels « stricts » sans garde mécanique nommée
**Où :** AD-1, AD-2, AD-3, AD-19 (et le scoping AD-10).
**Pourquoi :** Ce sont les invariants qui *définissent* l'architecture (hexagonal strict, contextes étanches, front→BFF seulement, pas d'import framework/ORM dans le domaine), mais ils sont énoncés en prose. La checklist exige des règles *enforceable* : sans garde CI, elles reposent sur la discipline et s'érodent au premier raccourci. AD-12 montre le bon patron (la tâche de codegen est nommée dans le pipeline) — les invariants structurels devraient l'imiter.
**Correctif :** Nommer le mécanisme : **règles de frontières en CI** via `eslint-plugin-boundaries` ou `dependency-cruiser` (interdiction d'import ORM/Nest dans `domain/`, interdiction d'accès cross-contexte au repo d'autrui, interdiction de `fetch` direct front→API), placées dans `packages/config` et **exécutées dans le pipeline `lint` Turborepo**. Pour AD-10, durcir au-delà de la convention de signature : exposer un **repository/policy scopé** par lequel passe obligatoirement toute requête, plutôt que de compter sur « chaque use-case n'oublie pas ».

### F4 — [MOYEN] Représentation des montants laissée ambiguë (le « ou ») + devise implicite
**Où :** AD-17 et table Consistency Conventions (« Entiers centimes **ou** VO `Money` »).
**Pourquoi :** Le « ou » autorise deux contextes à échanger des montants différemment **à travers les ports et les payloads d'événements** (l'un en centimes entiers, l'autre en objet `Money`) → exactement le type de divergence que la spine doit fermer. De plus la **devise n'est jamais nommée** (EUR implicite) ; un VO `Money` sans devise est sous-spécifié.
**Correctif :** Choisir **une** représentation canonique **au franchissement des frontières** (recommandé : entiers centimes dans DTO/événements/ports ; VO `Money` à l'intérieur du domaine, reconstruit au mapping), et l'imposer sans alternative. Déclarer **EUR** comme devise v1 (mono-devise).

### F5 — [MOYEN] Plusieurs dimensions ops/sécurité de l'enveloppe « initiative » silencieuses
**Où :** transversal.
**Pourquoi & correctifs :**
- **(a) Validation des fichiers déposés (FR23/AD-15/AD-16).** Le dépôt de facture est un **upload de fichier arbitraire** sans règle de type MIME, taille max, ni vérification que c'est bien un PDF. Risque sécurité direct. → Ajouter une convention : whitelist MIME `application/pdf`, taille bornée, nom assaini, stockage hors-webroot (déjà posé), idéalement scan.
- **(b) Rate-limiting / anti-bruteforce sur le login BFF** → non mentionné. Ajouter une règle (throttle par IP/compte, verrouillage progressif).
- **(c) Gestion des secrets sur o2switch** (secret JWT partagé AD-14, clé Brevo, creds BDD) → non adressé. Préciser : variables d'environnement hors dépôt, procédure de rotation du secret JWT.
- **(d) Tension RGPD vs AD-11.** AD-11 « jamais de suppression dure » + « politique de conservation déférée » entrent en conflit avec le **droit à l'effacement** RGPD pour une app FR multi-organisations traitant des données personnelles. → Au minimum, signaler la tension comme question ouverte ; distinguer désactivation (préservation de l'attribution) et obligations RGPD (anonymisation possible plutôt que suppression).
- **(e) Observabilité.** Aucune convention de logs/corrélation/alerte d'erreur. → Ajouter une convention minimale (log structuré, ID de corrélation BFF→API, alerte sur échec d'outbox/notifications).

### F6 — [BAS/MOYEN] Conventions de liste (pagination/tri/filtre) absentes
**Où :** Consistency Conventions ; concerne FR31 (tableaux de bord) et FR17 (listes de validation).
**Pourquoi :** Les tableaux de bord listent des CRA par acteur ; sans convention de pagination/tri/filtre, chaque endpoint de liste peut diverger (page vs cursor, tri par défaut, forme d'enveloppe).
**Correctif :** Ajouter une convention de contrat de liste (paramètres page/cursor, tri par défaut documenté, enveloppe de résultat paginée), alignée avec l'enveloppe d'erreur déjà standardisée.

### F7 — [BAS] Verrou optimiste vs domaine pur (note de cohérence)
**Où :** AD-7 (« verrou optimiste sur la version de l'agrégat ») × convention « entités domaine pures, modèles de persistance séparés + mappers ».
**Pourquoi :** Le numéro de version vit dans le **modèle de persistance** (MikroORM `@Version`), pas dans l'entité de domaine pure ; la « version de l'agrégat » doit être explicitement transportée par le mapper et exposée au use-case pour le contrôle de concurrence. Sans le dire, risque de l'oublier côté domaine/use-case.
**Correctif :** Préciser que la version est mappée vers/depuis le domaine (ou portée par le use-case) afin que le « premier valide gagne » soit vérifiable sans casser la pureté.

---

## Synthèse des sévérités

| # | Sévérité | Sujet |
| --- | --- | --- |
| F1 | Haut | Pas de sauvegarde/DR pour données probantes |
| F2 | Haut | Notifications sans outbox durable (transmission perdue) |
| F3 | Moyen | Invariants structurels « stricts » sans garde CI |
| F4 | Moyen | Représentation des montants ambiguë (« ou ») + devise implicite |
| F5 | Moyen | Ops/sécu silencieux : upload, rate-limit, secrets, RGPD, observabilité |
| F6 | Bas/Moyen | Conventions de liste/pagination absentes |
| F7 | Bas | Version optimiste vs domaine pur (note) |

Points forts à préserver : AD-6/AD-7/AD-8 (propriété TJM, machine à états, immuabilité + snapshot), AD-5 (Audit same-tx), AD-12 (anti-drift outillé), AD-14 (frontière = secret en mutualisé), AD-17 (anti-flottant). Couverture FR complète et versions à jour.
