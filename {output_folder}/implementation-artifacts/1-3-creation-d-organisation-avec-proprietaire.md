---
baseline_commit: 9194088ccec9784f65a14ed2ae28a707ab49d0d4
---

# Story 1.3: Création d'organisation avec propriétaire

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur authentifié,
I want créer mon organisation (prestataire ou cliente),
so that je dispose d'un espace rattaché à un propriétaire.

> Étend le contexte **IAM** (1.2) avec les agrégats **Organisation** et **Membership**. Première story qui utilise une route **authentifiée** (identité résolue par le BFF). Pas de gestion fine des membres/rôles ici (story 1.4) : seul le propriétaire créateur est posé.

## Acceptance Criteria

1. **Création d'organisation**
   **Given** un utilisateur authentifié
   **When** il crée une organisation en précisant son `nom` et son `type` (`prestataire` | `cliente`)
   **Then** l'organisation est créée et le créateur devient un **membre propriétaire actif** de cette organisation (FR1, FR2). [AD-23]

2. **Invariant ≥ 1 propriétaire actif**
   **Given** une organisation qui vient d'être créée
   **When** on inspecte ses membres
   **Then** elle a **au moins un propriétaire actif** (le créateur) ; le modèle interdit structurellement une organisation sans propriétaire actif (l'enforcement sur le *retrait* du dernier propriétaire relève de la story 1.4). [AD-23]

3. **Type valide & nom requis**
   **Given** une requête de création
   **When** le `type` n'est pas `prestataire`/`cliente`, ou le `nom` est vide/trop long
   **Then** la requête est rejetée au bord (400) sans créer d'organisation. [AD-13]

4. **Restitution des organisations de l'utilisateur**
   **Given** un utilisateur authentifié membre d'une ou plusieurs organisations
   **When** il demande ses organisations
   **Then** il reçoit la liste des organisations où il a une **appartenance active**, et **uniquement** celles-là (jamais celles d'autres utilisateurs). [AD-10]

## Tasks / Subtasks

- [x] **T1 — Domaine : Organisation + Membership** (AC: 1,2) [AD-2, AD-3, AD-23]
  - [x] `iam/domain/organisation.ts` : agrégat `Organisation` (id UUID v7, `nom`, `type`) ; VO `OrganisationType` (`prestataire`|`cliente`, validation)
  - [x] `iam/domain/membership.ts` : agrégat `Membership` (id, `orgId`, `userId`, `roles: Role[]`, `isActive`) avec `Role` incluant `OWNER` ; méthodes `isOwner()`, `deactivate()` (jamais de suppression — AD-11)
  - [x] Factory de domaine `Organisation.create(...)` qui produit l'organisation **et** la membership propriétaire active du créateur (garantit AC2 à la création)
  - [x] Ports : `OrganisationRepository` (`save`, `findById`), `MembershipRepository` (`save`, `findActiveByUser`, `findActiveOwnersByOrg`) — dans `domain/ports/`
  - [x] Domaine PUR (vérifié depcruise `domain-pure`)
- [x] **T2 — Persistance + migration** (AC: 1,4) [AD-18]
  - [x] Modèles MikroORM `organisations` (id, nom, type, created_at) et `memberships` (id, org_id, user_id, roles, is_active, created_at) — index (`user_id`), (`org_id`)
  - [x] Adapters repository (mapping domaine ↔ modèle ; `roles` stocké en JSON ou table de jonction — au choix, documenté)
  - [x] Migration `MigrationXXXXXXXX` (tables + index), jouée au déploiement
- [x] **T3 — Use-cases** (AC: 1,2,4) [AD-10]
  - [x] `CreateOrganisation(userId, nom, type)` : crée l'organisation + la membership propriétaire active (transaction) ; retourne `{ organisationId }`
  - [x] `ListMyOrganisations(userId)` : retourne les organisations où l'utilisateur a une appartenance **active**
- [x] **T4 — HTTP authentifié** (AC: 1,3,4) [AD-1, AD-13, AD-14]
  - [x] `POST /organisations` (route **authentifiée** — garde par défaut, exige `sub`) : body `CreateOrganisationDto` (`nom` + `type`) validé class-validator ; lit le `userId` via le **décorateur `@CurrentUser()`** (nouveau, lit `req.identity.userId`)
  - [x] `GET /organisations` : liste les organisations de l'utilisateur courant
  - [x] DTO de requête/réponse décorés (`@ApiBody`/`@ApiOkResponse`) → OpenAPI → client généré (AD-12)
- [x] **T5 — BFF Nuxt** (AC: 1,4) [AD-19]
  - [x] `server/utils/callApi.ts` (ou réutilisation) : helper qui résout l'identité (cookie → userId) et signe le JWT d'identité pour un appel **authentifié** ; renvoie 401 si non connecté
  - [x] Routes BFF `POST /api/organisations` et `GET /api/organisations` (relais authentifié)
  - [x] Page minimale `app/pages/organisation/nouvelle.vue` (formulaire nom + type — **design système = story 1.5**, ici brut/fonctionnel)
- [x] **T6 — Tests**
  - [x] Unitaires domaine : `OrganisationType` (valide/refuse), `Organisation.create` (produit une membership owner active), `Membership.isOwner/deactivate`
  - [x] Intégration use-cases : `CreateOrganisation` (créateur = owner actif), `ListMyOrganisations` (ne renvoie que les orgs de l'utilisateur, exclut les inactives)
  - [x] e2e supertest (MariaDB) : login → `POST /organisations` (201) → `GET /organisations` contient la nouvelle org ; un **second utilisateur ne voit pas** l'org du premier (cloisonnement AD-10) ; création sans identité → 401

### Review Findings

Revue adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) du 2026-06-30 — verdict : **Approve** (findings = robustesse, non bloquants).

- [x] [Review][Patch] `GET /organisations` peut renvoyer 500 si une ligne a un `type` hors-enum (`findByIds` reconstruit le VO, pas de catch dans `list`). Contraindre la colonne (CHECK) + mapping défensif. [mikro-organisation.repository.ts, migration]
- [x] [Review][Patch] `roles` JSON null/corrompu → `TypeError` dans `isOwner`/`findActiveOwnersByOrg`. Normaliser au mapping (`Array.isArray(r.roles) ? r.roles : []`). [mikro-membership.repository.ts]
- [x] [Review][Patch] Entité ORM `nom`/`type` sans `length` (→ varchar(255) par défaut) alors que migration = 200/20 → drift. Aligner `@Property({ length })`. [organisation.orm-entity.ts]
- [x] [Review][Patch] Pas de FK `memberships.org_id → organisations.id` ; l'atomicité AD-23 ne repose que sur l'appli. Ajouter la FK en migration (garde-fou BDD). [migration]
- [x] [Review][Patch] `@MaxLength(200)` appliqué avant trim (domaine trim après) → incohérence de frontière. `@Transform(trim)` sur le DTO. [create-organisation.dto.ts]
- [x] [Review][Patch] `nom` non normalisé (caractères de contrôle / bidi / zero-width passent). Nettoyer/rejeter les non-imprimables à la normalisation. [organisation.ts]
- [x] [Review][Patch] BFF en `$fetch` à types inline plutôt que les types du contrat généré (AD-12 sous-exploité). Exporter les types org depuis `@cra/contracts` et les consommer. [contracts/index.ts, server/api/organisations/*]
- [x] [Review][Patch] Nettoyage e2e trop large (`delete ... where id not in (select org_id from memberships)`) — restreindre aux ids créés par le test. [organisation.e2e-spec.ts]
- [x] [Review][Defer] Pas de contrainte d'unicité `memberships(org_id, user_id)` — à décider avec le flux de ré-ajout/réactivation en **story 1.4** (un unique strict bloquerait la réactivation après désactivation).
- [x] [Review][Defer] Double-submit / doublons d'organisations (pas d'idempotence ni d'unicité de nom) — **accepté en v1** (les noms d'orgs peuvent coïncider ; la prévention du double-clic = UI story 1.5). À revisiter si besoin.
- [x] [Review][Defer] `createdAt` double source (JS `new Date()` + `defaultRaw`) — inoffensif (la valeur JS gagne) ; cosmétique.

## Dev Notes

### Stories précédentes (1.1, 1.2) — patterns à réutiliser

- **Contexte IAM existant** (`apps/api/src/iam`) : ajouter Organisation/Membership **dans ce contexte** (la spine attribue Org/User/Membership/Rôle à IAM — AD-3). Structure hexagonale identique au sous-domaine auth : `domain/` (pur) + `application/` + `infrastructure/{persistence,http}`.
- **Route authentifiée** : la garde globale `BffIdentityGuard` est **default-deny**. Une route SANS `@Public`/`@BffOnly` exige un JWT d'identité avec `sub` → `req.identity.userId` est garanti présent. Créer un décorateur `@CurrentUser()` (param decorator) dans `shared-kernel/bff-auth` qui lit `req.identity.userId` (et lève si absent, défense en profondeur).
- **BFF → identité** : réutiliser `resolveIdentity(event)` (1.2) pour obtenir le `userId` depuis le cookie de session, puis `signBffToken(userId, secret)` pour l'appel authentifié. Factoriser un helper `callApiAuthenticated(event, path, opts)` si utile. Aucune route ne doit appeler l'API sans passer par le BFF (AD-19).
- **Contrat → client** : tout nouvel endpoint = DTO décoré (`@ApiBody` pour le corps — **piège vu en 1.2** : sans `@ApiBody`, le DTO de requête n'apparaît pas dans l'OpenAPI). Régénérer `pnpm --filter @cra/api emit:openapi && pnpm --filter @cra/contracts generate:client` ; commiter `schema.ts` (drift-check CI).
- **MikroORM** : types **explicites** (`type:`) sur les entités (esbuild/tsx n'émet pas les métadonnées) ; entités déclarées dans `mikro-orm.config.ts` ; `forceUtcTimezone: true` déjà actif ; migration via CLI au déploiement (AD-18).
- **Tests** : unit (Vitest, instanciation directe avec doublures) ; e2e supertest via la config `vitest.e2e.config.ts` (**unplugin-swc** pour les métadonnées de décorateurs) contre MariaDB ; `turbo run test` reste sans DB ; l'e2e tourne en CI (service MariaDB déjà configuré). Si on ajoute un repo/port, **mettre à jour les doublures des specs existantes** (rappel 1.2 : `findById` ajouté a cassé des fakes).
- **Dev local** : `pnpm db:up && pnpm db:migrate && pnpm dev` → http://localhost:3000. L'API dev tourne via `nest start --watch` (PAS tsx — métadonnées de décorateurs).

### Modèle de données & invariant AD-23

- `Organisation { id, nom, type }` ; `Membership { id, orgId, userId, roles[], isActive }`. Le lien user↔org passe **toujours** par `Membership` (pas de FK directe user→org).
- **AD-23 (≥ 1 propriétaire actif)** : garanti **à la création** par la factory (`Organisation.create` émet la membership owner active du créateur). La règle « interdire le retrait/désactivation du **dernier** propriétaire actif » s'appliquera en **story 1.4** (gestion des membres) — ici, fournir `MembershipRepository.findActiveOwnersByOrg` pour préparer cette vérification, mais ne pas implémenter le retrait.
- **AD-11** : une membership se **désactive** (`isActive=false`), jamais ne se supprime. Pas de suppression dans cette story.
- **AD-10 (cloisonnement)** : `ListMyOrganisations` filtre par `userId` du contexte d'acteur — **jamais** par un id passé dans la requête. Le `userId` vient **uniquement** de `@CurrentUser()` (identité signée), pas du body/query.
- Multi-appartenance autorisée (un user peut être membre de plusieurs organisations — FR4) : pas de limite sur le nombre d'organisations créées/rejointes.

### Rôles (périmètre)

- `Role` enum inclut au minimum `OWNER` ici. Les autres rôles (prestataire, valideur, payeur, propriétaire de projet) sont **par projet** et arrivent avec les projets (Epic 2) / la gestion des membres (1.4). Ne pas sur-modéliser : `OWNER` d'organisation suffit pour 1.3.

### Project Structure Notes

```text
apps/api/src/iam/
  domain/        # + organisation.ts, membership.ts, value-objects/organisation-type.ts, role.ts
                 #   + ports/organisation-repository.port.ts, ports/membership-repository.port.ts
  application/   # + create-organisation.use-case.ts, list-my-organisations.use-case.ts
  infrastructure/
    persistence/ # + organisation.orm-entity.ts, membership.orm-entity.ts, repos
    http/        # + organisation.controller.ts (+ DTO)
  iam.module.ts  # MODIFIÉ : forFeature(+entités), providers (+use-cases, +ports)
apps/api/src/shared-kernel/bff-auth/   # + current-user.decorator.ts (NEW)
apps/api/src/mikro-orm.config.ts       # MODIFIÉ : +entités Organisation/Membership
apps/api/src/migrations/               # + migration organisations/memberships
apps/web/server/api/organisations/     # + index.get.ts, index.post.ts (relais authentifié)
apps/web/app/pages/organisation/       # + nouvelle.vue (brut, design = 1.5)
```

### Fichiers existants à MODIFIER (lire avant — ne pas casser 1.1/1.2)

- `apps/api/src/iam/iam.module.ts` — ajouter entités (forFeature), use-cases, et bindings des nouveaux ports.
- `apps/api/src/mikro-orm.config.ts` — ajouter `OrganisationOrmEntity`, `MembershipOrmEntity` à `entities`.
- `packages/contracts/src/generated/schema.ts` — régénéré (drift-check CI).
- (Aucune modification de la garde/`bff-identity` : le mode « défaut » existant convient pour une route authentifiée ; on n'ajoute que `@CurrentUser()`.)

### Testing standards

- Domaine = unitaires ; use-cases = intégration (doublures en mémoire) ; e2e supertest contre MariaDB (login réel → org → liste + cloisonnement). `turbo run build lint test` doit rester vert + drift-check du contrat.

### References

- [Source: planning-artifacts/epics.md#Epic 1 — Story 1.3]
- [Source: ARCHITECTURE-SPINE.md#AD-23 (cycle de vie IAM, ≥1 propriétaire), #AD-3 (contextes étanches), #AD-11 (désactivation jamais suppression), #AD-10 (cloisonnement par appartenance au projet/orga), #AD-13 (validation au bord), #AD-1/#AD-14 (route authentifiée via BFF), #AD-12 (contrat→client), #AD-18 (migrations)]
- [Source: implementation-artifacts/1-2-inscription-connexion-par-email-mot-de-passe.md (contexte IAM, garde BFF, @ApiBody, e2e supertest+swc, pièges MikroORM/decorateurs)]
- [Source: specs/spec-ibasho-do-cra/SPEC.md — CAP-1 ; FR1, FR2]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMad dev-story)

### Debug Log References

- `OrganisationView.type` resserré de `string` vers l'union `OrganisationTypeValue` (alignement avec `OrganisationDto`).
- Import erroné corrigé dans le contrôleur (export inexistant `InvalidOrganisationType`).
- `saveNewWithOwner` : org + membership propriétaire dans une `em.transactional` unique (atomicité AD-23).

### Completion Notes List

- **AC1 — création** : `CreateOrganisation` ; la factory `Organisation.create` produit l'org + la membership **OWNER active** du créateur. Prouvé e2e (201) + unit.
- **AC2 — ≥1 propriétaire actif (AD-23)** : garanti à la création (factory + persistance atomique). `MembershipRepository.findActiveOwnersByOrg` fourni pour la story 1.4 (retrait du dernier owner), non utilisé ici.
- **AC3 — validation au bord** : DTO class-validator (`@IsIn` type, `@IsNotEmpty`/`@MaxLength` nom) + backstop domaine. Type invalide → 400 (prouvé e2e).
- **AC4 — restitution cloisonnée (AD-10)** : `ListMyOrganisations` filtre par le `userId` du contexte d'acteur (via `@CurrentUser()`), jamais par un id de la requête. Prouvé e2e : un second utilisateur ne voit pas l'org du premier.
- **Route authentifiée** : nouveau décorateur `@CurrentUser()` (lit `req.identity.userId`, 401 si absent) ; le contrôleur n'a pas de `@Public`/`@BffOnly` → garde par défaut (sub requis). Création sans identité → 401 (prouvé e2e).
- **AD-11** : `Membership.deactivate()` (jamais de suppression) ; pas de retrait dans cette story.
- **Validation** : `turbo run build lint test` = 12/12 ; **30 tests unit api** (+9) ; **e2e 10/10** (auth 5 + organisation 5) sur MariaDB ; contrat régénéré (endpoint + 3 DTO `/organisations`) ; migration `Migration20260630010000` appliquée. Hexagonal pur (depcruise vert).

### File List

**Contexte IAM (NEW)** — `apps/api/src/iam/` :
- `domain/` : `organisation.ts`, `membership.ts`, `role.ts`, `value-objects/organisation-type.ts` (+ specs `organisation.spec`, `membership.spec`, `organisation-type.spec`), `ports/{organisation-repository,membership-repository}.port.ts`
- `application/` : `create-organisation.use-case.ts`, `list-my-organisations.use-case.ts` (+ specs)
- `infrastructure/persistence/` : `organisation.orm-entity.ts`, `membership.orm-entity.ts`, `mikro-organisation.repository.ts`, `mikro-membership.repository.ts`
- `infrastructure/http/` : `organisation.controller.ts`, `dto/{create-organisation,organisation-responses}.dto.ts`
- `migrations/Migration20260630010000.ts` (organisations + memberships)

**NEW / MODIFIÉ (socle)** :
- `apps/api/src/shared-kernel/bff-auth/current-user.decorator.ts` (NEW)
- `apps/api/src/iam/iam.module.ts`, `apps/api/src/mikro-orm.config.ts` (+entités/providers/contrôleur)
- `apps/web/server/api/organisations/{index.post,index.get}.ts` (NEW), `apps/web/app/pages/organisation/nouvelle.vue` (NEW)
- `apps/api/test/organisation.e2e-spec.ts` (NEW)
- `packages/contracts/src/generated/schema.ts` (régénéré)

### Change Log

- 2026-06-30 — Story 1.3 implémentée : agrégats Organisation + Membership (rôle OWNER) dans IAM ; création atomique org+propriétaire (AD-23) ; route authentifiée via `@CurrentUser()` ; liste cloisonnée par appartenance (AD-10) ; BFF + page minimale. 4 AC validés (e2e). Suite 12/12, 30 tests unit, e2e 10/10. Statut → review.
- 2026-06-30 — Code review (Approve) : 8 patchs de robustesse appliqués. BDD : CHECK `type` + FK `memberships.org_id` (intégrité AD-23 ; flush org→membership forcé pour l'ordre FK) ; longueurs d'entités alignées. Défensif : `roles` JSON normalisé, `nom` nettoyé (caractères de contrôle/bidi), `@Transform(trim)` DTO. AD-12 : types du contrat exportés et consommés côté BFF. Test : cleanup e2e restreint aux orgs de test. Suite 12/12, e2e 10/10. Statut → done.
