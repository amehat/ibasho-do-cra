---
baseline_commit: 9eb3d0629e68155718765048f6767ca9c0418e82
---

# Story 1.4: Gestion des membres & rôles

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a propriétaire d'organisation,
I want ajouter des membres, leur attribuer des rôles cumulables, et désactiver ceux qui partent,
so that je gère mon équipe sans jamais perdre la traçabilité des actions passées.

> Complète la gestion d'organisation (1.3) : ajout/retrait de membres, rôles cumulables, et les **invariants durs** d'AD-23 (jamais sans propriétaire actif) et AD-11 (désactivation, jamais suppression). Première story avec **autorisation par rôle** (AD-9/AD-10 : seul un propriétaire d'orga agit). L'invitation d'un email **non encore inscrit** reste à l'Epic 2 (FR9/FR32) : ici on gère des comptes existants.

## Acceptance Criteria

1. **Ajout de membre & rôles cumulables**
   **Given** un propriétaire actif d'une organisation
   **When** il ajoute un utilisateur existant (par email) et lui attribue un ou plusieurs rôles valides pour le **type d'organisation** (prestataire → `prestataire` ; cliente → `valideur`/`payeur` ; `owner` des deux côtés)
   **Then** l'utilisateur devient membre actif avec ces rôles **cumulés** (FR3, FR4). Un email inconnu → 404 ; un rôle non valide pour le type d'orga → 400. [AD-13]

2. **Désactivation (jamais suppression)**
   **Given** un membre ayant déjà agi
   **When** le propriétaire le désactive
   **Then** la membership passe `isActive=false` (jamais supprimée), son attribution « X était valideur » reste lisible, et le membre **perd immédiatement l'accès** à l'organisation (FR3, AD-11).

3. **Invariant ≥ 1 propriétaire actif (AD-23)**
   **Given** une organisation avec un **seul** propriétaire actif
   **When** on tente de le désactiver, OU de lui retirer le rôle `owner`
   **Then** l'opération est **refusée** (409/422) ; l'organisation garde toujours au moins un propriétaire actif.

4. **Autorisation par rôle (AD-9/AD-10)**
   **Given** un utilisateur qui n'est **pas** propriétaire actif de l'organisation ciblée (membre simple, ou membre d'une autre orga)
   **When** il tente d'ajouter / modifier / désactiver un membre, ou de lister les membres
   **Then** l'opération est refusée (**403**) ; aucune information sur les membres ne fuit hors de l'organisation. [AD-10]

5. **Réactivation idempotente**
   **Given** un membre précédemment désactivé d'une organisation
   **When** le propriétaire le ré-ajoute
   **Then** la membership existante est **réactivée** (avec les nouveaux rôles), sans créer de doublon — une seule membership par `(org, user)`.

## Tasks / Subtasks

- [x] **T1 — Domaine : rôles, attribution, invariants** (AC: 1,2,3,5) [AD-2, AD-9, AD-11, AD-23]
  - [x] Étendre `Role` : `OWNER`, `PRESTATAIRE`, `VALIDEUR`, `PAYEUR` (cumulables)
  - [x] `Membership` : `setRoles(roles)`, `hasRole(r)`, `reactivate(roles)` (rebascule `isActive=true` + remplace les rôles) ; conserver `deactivate()` (AD-11)
  - [x] Règle de validité **rôle ↔ type d'organisation** (domaine pur) : prestataire → {owner, prestataire} ; cliente → {owner, valideur, payeur}. Erreur de domaine si incompatible.
  - [x] **Légalité vs autorisation** (AD-9) : le domaine garantit la cohérence (rôles valides, ≥1 owner via une règle qui reçoit le décompte) ; l'**application** garantit que l'acteur est propriétaire (port de politique).
- [x] **T2 — Persistance + migration** (AC: 5) [AD-18]
  - [x] **Unicité `memberships(org_id, user_id)`** (index unique) — résout le point différé de 1.3 ; la réactivation **met à jour** la ligne existante (pas d'insert)
  - [x] `MembershipRepository` : `findByOrgAndUser(orgId, userId)`, `findByOrg(orgId)` (tous, actifs+inactifs pour l'admin), `save(membership)`, conserver `findActiveByUser`, `findActiveOwnersByOrg`
  - [x] Migration : `add unique (org_id, user_id)`
- [x] **T3 — Use-cases (autorisation + invariants)** (AC: 1,2,3,4,5) [AD-9, AD-10, AD-23]
  - [x] Port `MembershipPolicy.requireActiveOwner(actorUserId, orgId)` (lève 403 sinon) — résolu côté IAM (AD-14, rôles résolus à la requête, jamais portés par le BFF)
  - [x] `AddOrUpdateMember(actorId, orgId, memberEmail, roles)` : vérifie owner ; résout l'utilisateur par email (404 sinon) ; valide rôles↔type ; crée OU réactive la membership (idempotent AC5)
  - [x] `ChangeMemberRoles(actorId, orgId, memberUserId, roles)` : vérifie owner ; valide ; **refuse de retirer `owner` au dernier propriétaire actif** (AD-23)
  - [x] `DeactivateMember(actorId, orgId, memberUserId)` : vérifie owner ; **refuse la désactivation du dernier propriétaire actif** (AD-23) ; désactive (AD-11)
  - [x] `ListMembers(actorId, orgId)` : vérifie owner ; retourne les membres (avec statut + rôles)
- [x] **T4 — HTTP authentifié** (AC: 1,2,3,4) [AD-1, AD-13, AD-14]
  - [x] Sous-ressource `organisations/:orgId/members` : `GET` (liste), `POST` (ajout `{email, roles}`), `PATCH /:userId` (rôles), `DELETE /:userId` (désactivation)
  - [x] `@CurrentUser()` = acteur ; mapper les erreurs domaine/app → 400/403/404/409 ; DTO décorés (`@ApiBody`/réponses) → OpenAPI → client (AD-12)
- [x] **T5 — BFF Nuxt** (AC: 1,2,4) [AD-19]
  - [x] Routes BFF authentifiées `GET/POST/PATCH/DELETE /api/organisations/:orgId/members` (relais via `resolveIdentity` + JWT d'identité, types `@cra/contracts`)
  - [x] Page minimale `app/pages/organisation/membres.vue` (liste + ajout par email + rôles ; brut, design = story 1.5)
- [x] **T6 — Tests**
  - [x] Domaine : validité rôle↔type, `reactivate`, `hasRole`, règle « dernier owner » (sur décompte)
  - [x] Use-cases : autorisation (non-owner → refus), email inconnu → erreur, réactivation idempotente, refus désactivation/retrait-owner du dernier propriétaire, cumul de rôles
  - [x] e2e supertest (MariaDB) : owner ajoute un membre (201) → liste le montre ; **non-owner → 403** ; désactivation → le membre désactivé n'apparaît plus comme actif ; **désactivation du dernier owner → 409** ; réactivation → pas de doublon (unicité)

### Review Findings

Revue adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) du 2026-06-30 — verdict : **Changes Requested** (2 trous AD-23).

- [x] [Review][Patch][BLOQUANT] `AddOrUpdateMember` contourne AD-23 : `reactivate(roles)` écrase les rôles d'un membre **actif** sans garde dernier-owner → un POST `{email: dernier owner, roles:[prestataire]}` retire OWNER → orga sans propriétaire. Appliquer la garde dernier-owner sur ce chemin. [add-or-update-member.use-case.ts]
- [x] [Review][Patch][HAUTE] Course « dernier propriétaire » (check-then-act non atomique, `em.fork()` séparés) : deux désactivations/retraits-owner simultanés laissent l'orga sans owner. Lecture du décompte + écriture dans **une seule transaction avec verrou** (`PESSIMISTIC_WRITE`). [deactivate-member, change-member-roles, add-or-update-member]
- [x] [Review][Patch] Insertion concurrente d'un même (org,user) → 500 (violation d'unicité non mappée). Mapper `UniqueConstraintViolationException` → 409. [members.controller.ts]
- [x] [Review][Patch] Rôles écrasés (le « cumul » FR4 est en réalité un remplacement) + doublons acceptés. Clarifier la sémantique (l'API pose l'ensemble complet des rôles) + **dédupliquer** (`[...new Set]`) dans `setRoles`/`reactivate`. [membership.ts, test]
- [x] [Review][Patch] Drift contrat (AD-12) : POST renvoie 201 mais le contrat dit 200. Aligner (`@HttpCode(201)` + `@ApiCreatedResponse`) + régénérer. [members.controller.ts]
- [x] [Review][Defer] Désactivation d'un membre déjà inactif → 404 (non idempotent) — 404 jugé acceptable (n'est plus un membre actif).
- [x] [Review][Defer] Org inexistante → 403 (policy court-circuite) vs code 404 mort dans certains use-cases — sémantique homogène à revoir, non bloquant.
- [x] [Review][Defer] AD-11 « sessions invalidées » non littéral — assumé (résolution live des rôles, AD-14) ; à surveiller en Epic 2 si des rôles sont un jour cachés.
- [x] [Review][Defer] Enveloppe d'erreur sans code enum stable (convention spine) — dette pré-existante (1.1-1.4), à traiter globalement.

## Dev Notes

### Stories précédentes (1.1–1.3) — patterns à réutiliser

- **Contexte IAM** (`apps/api/src/iam`) déjà riche : `User`, `Session`, `Organisation`, `Membership` (rôle `OWNER`), VO `OrganisationType`, ports + repos MikroORM, `@CurrentUser()`. **Étendre**, ne pas recréer.
- **`findActiveOwnersByOrg`** est **déjà implémenté** (préparé en 1.3) : l'utiliser pour la règle « ≥ 1 propriétaire actif » (compter les owners actifs **avant** désactivation/retrait de rôle).
- **Autorisation par rôle** : nouveau pattern de la story. Le BFF ne porte que l'identité (AD-14) → la vérification « l'acteur est-il owner de cette org ? » se fait **côté IAM à la requête** (`findByOrgAndUser` + `hasRole(OWNER)` + `isActive`). C'est la **résolution live des rôles** : un membre désactivé perd l'accès **au prochain appel**, sans invalidation de session (AC2 « perd immédiatement l'accès » est satisfait par l'autorisation live, pas par un cache de rôles dans le JWT/session).
- **Séparation AD-9** : le **domaine** valide la cohérence (rôles compatibles avec le type, règle dernier-owner sur un décompte fourni) ; l'**application** fait l'autorisation (acteur = owner) via un port de politique. Ne pas mélanger.
- **Unicité membership** : ajouter l'index unique `(org_id, user_id)` (point différé de 1.3). **Conséquence** : la ré-affectation d'un membre déjà présent (même désactivé) **réactive** la ligne (`findByOrgAndUser` → `reactivate`), elle n'insère pas. Sinon violation d'unicité.
- **Contrat → client** : `@ApiBody` obligatoire sur les corps (piège 1.2) ; régénérer + commiter `schema.ts` (drift-check CI). Consommer les types générés côté BFF (rappel review 1.3).
- **MikroORM** : types explicites (`type:`, `length:`) sur les entités (drift) ; migration via CLI au déploiement ; `em.fork()` par opération ; **ordre d'écriture** explicite si FK (leçon 1.3 : flush parent avant enfant).
- **Tests** : unit (Vitest, doublures) ; e2e supertest via `vitest.e2e.config.ts` (**unplugin-swc**) contre MariaDB ; `turbo run test` sans DB ; e2e en CI (service MariaDB). **Mettre à jour les doublures** des specs existantes si un port gagne une méthode (leçon récurrente).
- **Dev local** : `pnpm db:up && pnpm db:migrate && pnpm dev` → http://localhost:3000 ; API en `nest start --watch`.

### Modèle de rôles (périmètre 1.4)

- Rôles **portés par la membership d'organisation** : `owner`, `prestataire` (orga prestataire), `valideur`/`payeur` (orga cliente). Cumulables (FR4).
- Les **désignations par projet** (LE valideur/payeur d'un projet donné, propriétaire de projet) arrivent à l'**Epic 2**. Ici, la membership établit qu'un utilisateur **peut** tenir ce rôle dans l'orga ; pas de lien projet.
- `owner` est le seul rôle qui **autorise la gestion des membres** (AC4).

### Invariant AD-23 — règle du dernier propriétaire

- Avant `DeactivateMember` ou un `ChangeMemberRoles` qui retire `owner` : compter les **propriétaires actifs** (`findActiveOwnersByOrg`). Si la cible est le **seul** owner actif → refuser (409/422). Sinon autoriser.
- À implémenter dans l'**application** (a besoin du repo) en s'appuyant sur une **règle de domaine** testable (ex. `MembershipPolicy.assertNotLastOwner(targetIsOwner, activeOwnerCount)`), pour garder la logique pure testée.

### Project Structure Notes

```text
apps/api/src/iam/
  domain/        # Role (étendu), membership.ts (setRoles/reactivate/hasRole),
                 #   value-objects/role-compatibility (ou règle dans Membership/Organisation),
                 #   ports/membership-repository.port.ts (+findByOrgAndUser, findByOrg)
  application/   # add-or-update-member, change-member-roles, deactivate-member, list-members (use-cases)
                 #   ports/membership-policy.port.ts (requireActiveOwner)
  infrastructure/
    persistence/ # mikro-membership.repository.ts (+méthodes) ; migration unique(org_id,user_id)
    http/        # members.controller.ts (+ DTO) — sous /organisations/:orgId/members
    security/    # membership-policy.adapter (résout owner via repo)
apps/web/server/api/organisations/[orgId]/members/  # relais BFF
apps/web/app/pages/organisation/membres.vue          # page brute
```

### Fichiers existants à MODIFIER (lire avant — ne pas casser 1.1–1.3)

- `apps/api/src/iam/domain/role.ts` (étendre l'enum) ; `membership.ts` (+méthodes) ; `ports/membership-repository.port.ts` (+méthodes).
- `apps/api/src/iam/infrastructure/persistence/mikro-membership.repository.ts` (+méthodes) ; **nouvelle migration** unique.
- `apps/api/src/iam/iam.module.ts` (+use-cases, +controller, +policy provider).
- `packages/contracts/src/index.ts` + `schema.ts` (régénéré) ; specs existantes (doublures de repo si signatures changent).
- ⚠️ La membership inactive est désormais consommée par `ListMembers` (actifs+inactifs) mais **jamais** par `findActiveByUser`/`findActiveOwnersByOrg` (qui filtrent `isActive`). Ne pas casser le cloisonnement de 1.3.

### Testing standards

- Domaine = unitaire ; use-cases = intégration (doublures) ; e2e supertest contre MariaDB (owner/non-owner, dernier-owner, réactivation). `turbo run build lint test` vert + drift-check contrat.

### References

- [Source: planning-artifacts/epics.md#Epic 1 — Story 1.4]
- [Source: ARCHITECTURE-SPINE.md#AD-23 (≥1 propriétaire actif), #AD-11 (désactivation jamais suppression), #AD-10 (cloisonnement + autorisation par appartenance), #AD-9 (légalité domaine vs autorisation application), #AD-14 (identité-seule, rôles résolus à la requête), #AD-13 (validation au bord), #AD-12 (contrat→client), #AD-18 (migrations)]
- [Source: implementation-artifacts/1-3-creation-d-organisation-avec-proprietaire.md (Organisation/Membership, findActiveOwnersByOrg, @CurrentUser, FK/flush, points différés : unicité membership)]
- [Source: PRD prd.md FR3, FR4 ; addendum (Membre désactivé jamais supprimé)]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMad dev-story)

### Debug Log References

- `Membership.isOwner()` réintégré (= `hasRole(OWNER)`) : les specs de 1.3 l'utilisaient ; conservé comme méthode de confort.
- Import `Role` dans `dto/member.dto.ts` corrigé en `../../../domain/role` (3 niveaux).

### Completion Notes List

- **AC1 — ajout + rôles cumulables** : `AddOrUpdateMember` (owner only) ; rôles validés par `role-policy` selon le type d'orga ; email inconnu → 404, rôle invalide → 400. Prouvé e2e + unit.
- **AC2 — désactivation (AD-11)** : `DeactivateMember` → `isActive=false`, attribution conservée. **Accès retiré immédiatement par autorisation live** (AD-14 : rôles résolus à la requête via `findByOrgAndUser`, jamais cachés dans le JWT/session) — pas d'invalidation de session nécessaire. Prouvé e2e (membre inactif).
- **AC3 — ≥1 propriétaire actif (AD-23)** : `assertNotLastActiveOwner` (domaine pur, sur décompte `findActiveOwnersByOrg`) ; désactivation/retrait-owner du dernier propriétaire → 409. Prouvé e2e + unit.
- **AC4 — autorisation par rôle (AD-9/AD-10)** : port `MembershipPolicy.requireActiveOwner` (adapter IAM) ; non-owner → 403 sur toutes les routes membres. Prouvé e2e.
- **AC5 — réactivation idempotente** : **index unique `(org_id, user_id)`** (point différé de 1.3 traité) ; `findByOrgAndUser` → `reactivate` (pas d'insert) → un seul enregistrement. Prouvé e2e (pas de doublon).
- **Séparation AD-9** respectée : domaine = cohérence (rôles↔type, dernier-owner) ; application = autorisation (port de politique).
- **Validation** : `turbo run build lint test` = 12/12 ; **45 tests unit** (+15) ; **e2e 17/17** (auth 5 + org 5 + membres 7) sur MariaDB ; contrat régénéré (2 endpoints + 3 DTO membres) ; migration `Migration20260630020000` (unique). Hexagonal pur (depcruise vert).

### File List

**Domaine (NEW/MOD)** — `apps/api/src/iam/domain/` :
- `role.ts` (étendu : OWNER/PRESTATAIRE/VALIDEUR/PAYEUR), `membership.ts` (setRoles/hasRole/isOwner/reactivate), `membership-rules.ts` (NEW : assertNotLastActiveOwner), `value-objects/role-policy.ts` (NEW), `ports/membership-repository.port.ts` (+findByOrgAndUser/findByOrg/save), `ports/user-repository.port.ts` (+findByIds) (+ specs role-policy/membership-rules/membership)

**Application (NEW/MOD)** — `apps/api/src/iam/application/` :
- `add-or-update-member`, `change-member-roles`, `deactivate-member`, `list-members` `.use-case.ts` (+ specs add/deactivate), `ports/membership-policy.port.ts` (NEW), `errors.ts` (+Forbidden/OrgNotFound/UserNotFound/MemberNotFound)

**Infrastructure (NEW/MOD)** :
- `persistence/mikro-membership.repository.ts` (+3 méthodes), `persistence/mikro-user.repository.ts` (+findByIds), `security/membership-policy.adapter.ts` (NEW), `http/members.controller.ts` (NEW), `http/dto/member.dto.ts` (NEW)
- `migrations/Migration20260630020000.ts` (unique org_id/user_id), `iam.module.ts` (câblage)

**BFF (NEW)** : `apps/web/server/api/organisations/[orgId]/members/{index.get,index.post,[userId].patch,[userId].delete}.ts`, `apps/web/app/pages/organisation/membres.vue`
**Contrat** : `packages/contracts/src/index.ts` (+types membres), `src/generated/schema.ts` (régénéré)
**Test** : `apps/api/test/members.e2e-spec.ts` (NEW)

### Change Log

- 2026-06-30 — Story 1.4 implémentée : gestion des membres & rôles (cumulables) dans IAM. Ajout/réactivation idempotente (unique org/user), désactivation (AD-11), interdiction de retirer le dernier propriétaire (AD-23), autorisation par rôle owner (AD-9/AD-10 via port de politique), accès retiré par résolution live des rôles (AD-14). 5 AC validés. Suite 12/12, 45 tests unit, e2e 17/17. Statut → review.
- 2026-06-30 — Code review (Changes Requested) traitée : 5 patchs. 2 trous AD-23 fermés : garde dernier-owner sur AddOrUpdateMember (POST) + atomicité transactionnelle avec verrou pessimiste (withOrgOwnerGuard) sur désactivation/changement de rôles/ajout — ferme la course TOCTOU. Mapping unicité→409, déduplication des rôles, alignement POST→201/contrat. +tests (POST-last-owner unit + e2e). Suite 12/12, 46 unit, e2e 18/18. Statut → done.
