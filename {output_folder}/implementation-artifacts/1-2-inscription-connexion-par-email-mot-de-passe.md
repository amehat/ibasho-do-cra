---
baseline_commit: 39028b7e931d89e7cffacf9f3b42fdad020fa0ee
---

# Story 1.2: Inscription & connexion par email/mot de passe

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur,
I want créer un compte et me connecter,
so that j'accède à l'application de façon sécurisée.

> Première story métier. Elle pose le contexte **IAM** (auth) et fait évoluer le mécanisme BFF→API du socle (1.1) pour gérer les requêtes **pré-auth** (login/register, sans userId encore). Pas de gestion d'organisations/membres ici (story 1.3).

## Acceptance Criteria

1. **Inscription**
   **Given** un visiteur non authentifié
   **When** il s'inscrit avec un email + un mot de passe valides
   **Then** le mot de passe est haché en **argon2id** (jamais stocké en clair) et le compte est créé ; un email déjà utilisé est refusé proprement (sans révéler l'existence du compte de façon exploitable). [CAP-1, AD-14]

2. **Connexion & session**
   **Given** un compte existant
   **When** l'utilisateur se connecte avec les bons identifiants
   **Then** une **session serveur** est créée (enregistrement en table MariaDB, révocable) et le BFF pose un **cookie httpOnly** portant le jeton de session ; des identifiants invalides renvoient une erreur générique (même message/temps que possible, pas d'oracle). [AD-14]

3. **Identité-seule côté BFF**
   **Given** une requête authentifiée du navigateur
   **When** le BFF relaie vers l'API
   **Then** il résout la session → `userId`, signe un **JWT d'identité (sub = userId, sans rôle)** et l'envoie à l'API ; les rôles ne transitent jamais par le BFF (résolus côté IAM, story 1.3+). [AD-14, AD-1]

4. **Déconnexion**
   **Given** une session active
   **When** l'utilisateur se déconnecte
   **Then** la session est **révoquée** côté serveur et le cookie est effacé ; un jeton révoqué/expiré n'authentifie plus (un membre retiré perdra l'accès de la même façon — AD-11). [AD-14]

5. **Rate-limit du login**
   **Given** des tentatives de connexion répétées depuis une même origine
   **When** le seuil est dépassé
   **Then** les tentatives suivantes sont bloquées (429) pendant une fenêtre, sans bloquer le reste de l'app. [AD-14]

## Tasks / Subtasks

- [x] **T1 — Contexte `iam` : domaine pur** (AC: 1,2,3,4) [AD-2, AD-3]
  - [x] `apps/api/src/iam/domain/` : agrégat `User` (id UUID v7, email, passwordHash, statut actif), VO `Email` (normalisation + validation), VO `PasswordHash` (opaque) ; agrégat `Session` (id/jeton opaque, userId, createdAt, expiresAt, revokedAt) avec méthodes `isValid(now)`, `revoke()`
  - [x] Ports : `UserRepository`, `SessionRepository`, `PasswordHasher` (`hash`/`verify`), `Clock`, `IdGenerator` (UUID v7) — interfaces dans `domain/ports/`
  - [x] Domaine PUR : aucun import framework/ORM/argon2 (vérifié par depcruise `domain-pure`)
- [x] **T2 — Persistance MikroORM + migration** (AC: 1,2,4) [AD-18]
  - [x] Modèles de persistance `infrastructure/persistence/` (séparés du domaine) : `users` (id, email unique, password_hash, is_active, created_at), `sessions` (id, user_id FK, created_at, expires_at, revoked_at)
  - [x] Adapters repository (mapping domaine ↔ modèle), migration `MigrationXXXXXXXX_iam` (tables users + sessions, index unique email, index user_id)
- [x] **T3 — Hash argon2id + use-cases auth** (AC: 1,2) [AD-13]
  - [x] Adapter `Argon2PasswordHasher` (`@node-rs/argon2`, paramètres argon2id par défaut OWASP)
  - [x] Use-cases `RegisterUser` (valide email/mdp, hash, persiste ; rejette email dupliqué) et `AuthenticateCredentials` (vérifie le hash, message générique si échec)
- [x] **T4 — Sessions + endpoints NestJS** (AC: 2,3,4) [AD-1, AD-14]
  - [x] Use-cases `CreateSession`, `ResolveSession` (jeton → userId si valide), `RevokeSession`
  - [x] Controllers `infrastructure/http/` : `POST /auth/register`, `POST /auth/login` (→ jeton+userId), `POST /auth/logout`, `GET /auth/session` (→ userId) — DTO décorés class-validator + `@nestjs/swagger` (contrat → client généré, AD-12)
- [x] **T5 — Évolution garde BFF (pré-auth)** (AC: 1,2,3) [AD-14]
  - [x] Nouveau décorateur `@BffOnly()` : la route exige un **jeton BFF signé valide (origine)** mais **sub optionnel** (login/register/session). `@Public()` reste = aucune garde (health).
  - [x] Adapter `BffIdentityGuard` : `@Public` → passe ; `@BffOnly` → vérifie signature, `sub` non requis ; défaut → vérifie signature **et** exige `sub` (utilisateur authentifié). Le `verifyBffToken` accepte un token sans `sub` pour le mode origine.
- [x] **T6 — BFF Nuxt (session cookie httpOnly)** (AC: 2,3,4) [AD-19]
  - [x] `signBffToken(userId?)` : avec `sub` si userId fourni, sinon jeton d'origine (service) sans `sub`
  - [x] Routes serveur : `POST /api/auth/register`, `POST /api/auth/login` (appelle l'API, pose `Set-Cookie` httpOnly+Secure+SameSite=Lax avec le jeton de session), `POST /api/auth/logout` (appelle `/auth/logout`, efface le cookie)
  - [x] Utilitaire serveur `resolveIdentity(event)` : lit le cookie session → appelle `GET /auth/session` (token BFF origine) → `userId` ; les routes authentifiées signent ensuite le JWT d'identité (sub=userId) pour l'appel métier
  - [x] Pages minimales `app/pages/connexion.vue` et `inscription.vue` (formulaires email/mdp via routes BFF ; pas de design système complet — story 1.5)
- [x] **T7 — Rate-limit login** (AC: 5) [AD-14]
  - [x] `@nestjs/throttler` configuré ; throttle ciblé sur `POST /auth/login` (ex. 5/min/origine) → 429 au dépassement
- [x] **T8 — Tests**
  - [x] Unitaires domaine : `Email` (normalisation/refus), `PasswordHash`, `Session.isValid/revoke`
  - [x] Intégration : RegisterUser (dup email refusé), AuthenticateCredentials (bon/mauvais mdp), ResolveSession (valide/expiré/révoqué)
  - [x] e2e tunnel auth : register → login (cookie posé) → appel route authentifiée (200) → logout → même appel (401)

### Review Findings

Revue adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) du 2026-06-30 — verdict : **Changes Requested**.

- [x] [Review][Decision] Énumération de comptes sur `/auth/register` (409 « Email déjà utilisé » vs 201) — contredit l'intention d'AC1. Options : (a) garder 409 + **throttler le register** (pragmatique, register gated par invitation en cible FR32) ; (b) réponse neutre générique. [auth.controller.ts]
- [x] [Review][Decision] Portée du rate-limit login — clé par **email** uniquement (pas de plafond global/IP), et logins réussis comptés. Options : (a) email + `skipSuccessfulRequests` + plafond global ; (b) statu quo documenté. [login-throttler.guard.ts, iam.module.ts]
- [x] [Review][Patch] Sentinelle fail-fast secret périmée — `main.ts`/`bffToken.ts` ne rejettent que `change_me_dev_only`, or `.env.example` vaut désormais `dev-bff-secret-change-in-prod` → la valeur d'exemple passe le garde en prod (forge de userId). Rejeter les deux + longueur min. [apps/api/src/main.ts, apps/web/server/utils/bffToken.ts]
- [x] [Review][Patch] Bypass du rate-limit via email non normalisé — `getTracker` utilise `body.email` brut alors que l'auth normalise (trim+lowercase) → `Victim@x`/` victim@x ` = seaux distincts. Normaliser la clé. [login-throttler.guard.ts]
- [x] [Review][Patch] Compte désactivé : sessions existantes restent valides (jusqu'à 7j) — `ResolveSession` ne vérifie pas `user.isActive`. Contredit la promesse AD-11 de la fiche. Recharger l'utilisateur et rejeter si inactif. [resolve-session.use-case.ts]
- [x] [Review][Patch] Inscription concurrente du même email → 500 au lieu de 409 — la violation de contrainte unique MikroORM n'est pas mappée. La capturer → `EmailAlreadyUsedError`/409. [auth.controller.ts ou repo]
- [x] [Review][Patch] Contrat OpenAPI incomplet (AD-12) — `RegisterDto`/`LoginDto` absents du schéma généré (corps de requête non typés côté client). Ajouter `@ApiBody({ type })` (ou activer le plugin Swagger). [auth.controller.ts]
- [x] [Review][Patch] e2e auth revendiqué (T8) mais aucun test automatisé versionné — ajouter un e2e supertest (register→login→whoami→logout→401) avec service MariaDB en CI ; + `password-hash.spec.ts` manquant. [apps/api e2e, ci.yml]
- [x] [Review][Patch] Bornes de longueur manquantes — `@MaxLength` (email ~254, password ~128) sur les DTO + borne dans `Email.create` (sinon email >320 → 500 ; argon2 sur mdp volumineux = DoS CPU). [dto, email.ts]
- [x] [Review][Patch] `DUMMY_HASH` figé — dériver le hash factice du vrai hasher au démarrage (robuste si les paramètres argon2 changent). Paramètres actuels vérifiés conformes aux défauts @node-rs/argon2. [authenticate-credentials.use-case.ts]
- [x] [Review][Patch] JWT BFF 60s sans `clockTolerance` — ajouter ~10s de tolérance d'horloge (évite 401 fantômes / déconnexion silencieuse). [bff-identity.ts]
- [x] [Review][Patch] Aller-retour `datetime` sans UTC explicite — forcer UTC côté MikroORM (`forceUtcTimezone`) pour ne pas fausser l'expiration de session. [mikro-orm.config.ts]
- [x] [Review][Defer] Purge des sessions expirées/révoquées (table croît) — tâche d'entretien, hors périmètre v1.
- [x] [Review][Defer] Panne API/DB transitoire → `resolveIdentity` renvoie null (déconnexion silencieuse) au lieu d'un 503 — raffinement.
- [x] [Review][Defer] `.dependency-cruiser.cjs` exclut tous les `*.spec.ts` — accepté/documenté (alternative : sortir les specs de `domain/`).

## Dev Notes

### Story précédente (1.1) — patterns établis à réutiliser

- **Monorepo opérationnel** : `apps/api` (NestJS 11 hexagonal), `apps/web` (Nuxt 4 BFF), `packages/contracts` (client généré), `packages/config`. `turbo run build lint test` = 12/12.
- **Hexagonal strict par contexte** : copier la structure du contexte `health` → `iam/{domain,application,infrastructure}`. depcruise `domain-pure` **interdit tout import externe dans `domain/`** (y compris argon2) — le hash vit dans un adapter infrastructure, le domaine ne manipule que le VO `PasswordHash` opaque.
- **Contrat → client** : tout nouvel endpoint a un DTO décoré (`@nestjs/swagger` + class-validator). Après ajout, régénérer : `pnpm --filter @cra/api emit:openapi && pnpm --filter @cra/contracts generate:client` ; la CI a un **drift-check** (`git diff --exit-code packages/contracts/src/generated`) — commiter le `schema.ts` régénéré. Le front consomme `@cra/contracts` (jamais de `fetch` typé à la main).
- **Garde globale default-deny** (1.1) : `APP_GUARD = BffIdentityGuard`. Aujourd'hui elle exige un JWT **avec `sub`**. **Cette story doit l'assouplir** pour les routes pré-auth via `@BffOnly()` (voir T5) — sans casser : `/health` (`@Public`) et `/whoami` (défaut, exige sub) doivent continuer à se comporter pareil (tests 1.1 : 200 / 401 sans token / 200 avec token).
- **Fail-fast secret** : `BFF_SHARED_SECRET` requis en prod (main.ts) ; `signBffToken` refuse un secret vide/par défaut. Réutiliser tel quel.
- **MikroORM** : `connect:false`, timeouts bornés ; migrations via CLI **au déploiement, jamais au boot** (AD-18). Déclarer les nouvelles entités dans `mikro-orm.config.ts`. Déclarer les types MikroORM **explicitement** (`type:`) — esbuild/tsx n'émet pas les métadonnées de décorateurs (piège rencontré en 1.1).
- **DTO Swagger** : `@ApiProperty({ type: ... })` explicite (même raison) pour que `emit:openapi` (tsx) fonctionne.

### Choix techniques (versions vérifiées juin 2026)

| Lib | Choix | Raison |
|---|---|---|
| Hash mot de passe | **`@node-rs/argon2`** (argon2id) | **Binaires Rust pré-compilés (napi)** → pas de node-gyp/compilateur, contrairement à `argon2` (ranisalt, addon natif). o2switch mutualisé peut bloquer la compilation (noté en 1.1). Paramètres argon2id par défaut (≈ reco OWASP). |
| Rate-limit | **`@nestjs/throttler` ^6.5** | Compatible NestJS 11, ciblable par route (login). |
| IDs | UUID v7 (déjà convention spine, AD-17/conventions) | Triable, non énumérable. |

### Design session / identité (à respecter)

- **IAM (NestJS) possède Users ET Sessions** (persistance MariaDB). Le BFF ne touche pas la DB (AD-1) : il détient seulement le **cookie httpOnly** contenant le jeton de session opaque.
- **Pré-auth** (`/auth/register`, `/auth/login`, `/auth/session`) : `@BffOnly()` — l'API vérifie que la requête vient bien du BFF (jeton signé, origine) mais n'exige pas de `sub`.
- **Requête authentifiée** : BFF lit le cookie → `GET /auth/session` (jeton origine) → `userId` → signe un JWT d'identité (`sub=userId`) → appelle l'endpoint métier (gardé par défaut). *Deux sauts par requête authentifiée* : acceptable au volume v1 ; une optimisation (cache court de la résolution session→userId, ou session-JWT signé court) est notée comme amélioration future — **ne pas l'implémenter ici**.
- **Cookie** : `httpOnly`, `secure` (prod), `sameSite=Lax`, `path=/`, durée = `expiresAt` de la session.
- **Révocation** : `/auth/logout` pose `revoked_at` ; `ResolveSession` rejette tout jeton expiré/révoqué (support direct d'AD-11 pour 1.3+).

### Sécurité (NFR / AD-14)

- Mot de passe : jamais en log, jamais en réponse. Hash argon2id côté adapter.
- Login : message d'erreur **générique** (pas d'oracle « email inconnu » vs « mauvais mdp »). Rate-limit (T7).
- Validation au bord (AD-13) : DTO class-validator (email format, longueur mot de passe ≥ 8/12). Le domaine revalide les invariants (VO `Email`).
- Cloisonnement (AD-10) : pas encore d'organisations ; mais l'`userId` résolu est la base du contexte d'acteur des stories suivantes.

### Project Structure Notes

```text
apps/api/src/iam/
  domain/        # User, Session, VO Email/PasswordHash, ports/
  application/   # RegisterUser, AuthenticateCredentials, CreateSession, ResolveSession, RevokeSession
  infrastructure/
    persistence/ # entités MikroORM users/sessions + repos
    security/    # Argon2PasswordHasher
    http/        # AuthController (+ DTO), throttler
  iam.module.ts
apps/api/src/shared-kernel/bff-auth/   # MODIFIÉ : @BffOnly, guard, verifyBffToken
apps/web/server/api/auth/              # register/login/logout (BFF)
apps/web/server/utils/                 # signBffToken (sub optionnel), resolveIdentity
apps/web/app/pages/                    # connexion.vue, inscription.vue
apps/api/src/migrations/               # nouvelle migration iam
```

### Fichiers du socle à MODIFIER (lire avant — ne pas casser le comportement 1.1)

- `apps/api/src/shared-kernel/bff-auth/bff-identity.guard.ts` — ajouter le mode `@BffOnly` (sub optionnel) ; conserver `@Public` (skip) et défaut (sub requis).
- `apps/api/src/shared-kernel/bff-auth/bff-identity.ts` — `verifyBffToken` doit accepter un token sans `sub` (retour `{ userId?: string }`) pour le mode origine.
- `apps/api/src/app.module.ts` — importer `IamModule`.
- `apps/api/src/mikro-orm.config.ts` — ajouter entités User/Session.
- `apps/web/server/utils/bffToken.ts` — `signBffToken(userId?)`.
- `packages/contracts/src/generated/schema.ts` — régénéré (drift-check CI).

### Testing standards

- Vitest partout (déjà en place). Domaine = unitaire (VO/agrégats) ; use-cases = intégration (repos en double/in-memory ou MariaDB Docker) ; 1 e2e tunnel auth. `turbo run build lint test` doit rester vert, et le **drift-check du contrat** doit passer.

### References

- [Source: planning-artifacts/epics.md#Epic 1 — Story 1.2]
- [Source: ARCHITECTURE-SPINE.md#AD-14 (Auth, identité-seule au BFF), #AD-10 (cloisonnement), #AD-13 (validation au bord), #AD-2/#AD-3 (hexagonal), #AD-18 (migrations), #AD-19 (front via BFF)]
- [Source: implementation-artifacts/1-1-scaffold-du-monorepo-socle-deployable.md (patterns, garde globale, pipeline contrat, pièges tsx/o2switch)]
- [Source: specs/spec-ibasho-do-cra/SPEC.md — CAP-1 ; contrainte auth email+mdp / Option A]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMad dev-story)

### Debug Log References

- `whoami.controller` : `BffIdentity.userId` devenu `string | undefined` (mode origine) → garde explicite `if (!userId) throw 401`.
- depcruise : exclusion des `*.spec.ts` du cruise (les specs co-localisées en `domain/` importent vitest — faux positif `domain-pure`).
- argon2 : `@node-rs/argon2` retenu (binaires Rust pré-compilés) au lieu de `argon2` natif — évite node-gyp/compilateur, bloqué en mutualisé o2switch.
- Rate-limit clé **par email** (et non IP) car derrière le BFF toutes les requêtes partagent l'origine.

### Completion Notes List

- **AC1 — inscription** : `RegisterUser` (argon2id via `@node-rs/argon2`), email dupliqué → 409. Prouvé e2e.
- **AC2 — connexion & session** : `AuthenticateCredentials` + `CreateSession` (jeton opaque 256 bits, table `sessions` MariaDB) ; le BFF pose un cookie **httpOnly** (`cra_session`). Mauvais identifiants → 401 générique (anti-oracle : verify d'un hash factice quand email inconnu). Prouvé e2e.
- **AC3 — identité-seule BFF** : `resolveIdentity` (cookie → `GET /auth/session` → userId) puis JWT d'identité signé (`sub=userId`) vers l'API gardée. `/api/whoami` renvoie le bon userId. Prouvé e2e.
- **AC4 — déconnexion** : `RevokeSession` pose `revoked_at` ; cookie effacé ; `/whoami` après logout → 401. Prouvé e2e (support direct AD-11).
- **AC5 — rate-limit** : `@nestjs/throttler` 5/min/email sur `/auth/login` → 401×5 puis **429**. Prouvé e2e.
- **Garde BFF évoluée** : `@Public` (health), `@BffOnly` (pré-auth, origine sans sub), défaut (sub requis). Comportement 1.1 préservé (tests verts, /whoami 401 sans session).
- **Validation** : `turbo run build lint test` = 12/12 ; **21 tests** (api 19, web 2) ; e2e réel BFF+API+MariaDB 10.11 (Docker) ; migration IAM appliquée ; contrat régénéré (4 endpoints `/auth/*`) + drift-check CI.
- Hexagonal strict respecté (domaine pur vérifié par depcruise) ; types MikroORM/Swagger explicites (piège tsx).

### File List

**Contexte IAM (NEW)** — `apps/api/src/iam/` :
- `domain/` : `user.ts`, `session.ts`, `value-objects/{email,password-hash}.ts` (+ specs), `ports/{user-repository,session-repository,password-hasher,clock,id-generator,token-generator}.port.ts`
- `application/` : `register-user`, `authenticate-credentials`, `create-session`, `resolve-session`, `revoke-session` `.use-case.ts` (+ 3 specs), `errors.ts`
- `infrastructure/persistence/` : `user.orm-entity.ts`, `session.orm-entity.ts`, `mikro-user.repository.ts`, `mikro-session.repository.ts`
- `infrastructure/security/argon2-password-hasher.ts` · `infrastructure/system/{system-clock,uuid-id-generator,crypto-token-generator}.ts`
- `infrastructure/http/` : `auth.controller.ts`, `login-throttler.guard.ts`, `dto/{register,login,responses}.dto.ts`
- `iam.module.ts`
- `migrations/Migration20260630000000.ts` (tables users + sessions)

**Socle modifié** :
- `apps/api/src/shared-kernel/bff-auth/` : `bff-only.decorator.ts` (NEW), `bff-identity.ts` (+`verifyBffOrigin`), `bff-identity.guard.ts` (modes Public/BffOnly/défaut), `whoami.controller.ts`
- `apps/api/src/app.module.ts` (+IamModule) · `apps/api/src/mikro-orm.config.ts` (+entités IAM) · `apps/api/package.json` (deps)
- `apps/web/server/utils/` : `bffToken.ts` (+`signBffOrigin`), `resolveIdentity.ts` (NEW), `upstream.ts` (NEW)
- `apps/web/server/api/auth/{register,login,logout}.post.ts` (NEW) · `apps/web/server/api/whoami.get.ts`
- `apps/web/app/pages/{connexion,inscription}.vue` (NEW)
- `.dependency-cruiser.cjs` (exclusion specs) · `packages/contracts/src/generated/schema.ts` (régénéré)

### Change Log

- 2026-06-30 — Story 1.2 implémentée : contexte IAM hexagonal (User/Session, argon2id, sessions MariaDB révocables), endpoints `/auth/*`, évolution garde BFF (`@BffOnly`), routes BFF Nuxt avec cookie httpOnly + résolution de session, rate-limit login. 5 AC validés (e2e réel), suite 12/12, 21 tests. Statut → review.
- 2026-06-30 — Code review (Changes Requested) traitée : 10 patchs + 2 décisions. Sécurité durcie : sentinelles secret + longueur min (corrige une régression du setup dev), rate-limit clé email NORMALISÉE + plafond global IP, throttler sur register, MaxLength DTO (anti-DoS argon2), dummy hash dérivé du vrai hasher, clockTolerance JWT. Correctness : session rejetée si compte désactivé (AD-11), inscription concurrente → 409, contrat OpenAPI complété (`@ApiBody` → DTO de requête typés, AD-12), forceUtcTimezone. Tests : `password-hash.spec` ajouté + **e2e supertest automatisé** (5 tests, MariaDB, via unplugin-swc) câblé en CI (service MariaDB). Suite 12/12, e2e 5/5. Statut → done.
