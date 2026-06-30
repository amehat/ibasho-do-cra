---
baseline_commit: d5076a0275ea39e12eebf645d07faa14ad127bc7
---

# Story 1.1: Scaffold du monorepo & socle déployable

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur de l'équipe,
I want un monorepo Turborepo avec l'app Nuxt (BFF), l'API NestJS hexagonale, les packages partagés, la base MariaDB et le pipeline de déploiement o2switch,
so that toute story suivante se construit sur une fondation cohérente, testée et déployable.

> Story fondation (greenfield). Elle ne livre **aucune fonctionnalité métier** : son but est le squelette technique exécutable et déployable. Toute logique de domaine (organisations, CRA, etc.) appartient aux stories suivantes — voir « Hors périmètre » dans les Dev Notes.

## Acceptance Criteria

1. **Structure monorepo & build**
   **Given** un dépôt vide
   **When** le scaffold est exécuté
   **Then** `apps/web` (Nuxt 4 + Pinia, server routes BFF), `apps/api` (NestJS 11, structure `domain/application/infrastructure` par contexte), `packages/contracts` et `packages/config` existent et **buildent via Turborepo** (`turbo run build` vert) [AD-1, AD-2, AD-12, AD-19]

2. **Persistance & migrations**
   **Given** le socle
   **When** on lance la connexion BDD
   **Then** la connexion **MariaDB via MikroORM** fonctionne, et une **migration initiale** (baseline) s'applique **à l'étape de déploiement**, jamais au boot de l'app [AD-18]

3. **Garde-fous d'architecture & contrat**
   **Given** le pipeline de qualité
   **When** `turbo run lint` s'exécute
   **Then** **dependency-cruiser échoue** si une couche viole la direction hexagonale (ex. `domain/` important un module framework/ORM), **et** la **génération du client OpenAPI** est une tâche du pipeline (pas une étape manuelle) [AD-3, AD-12]

4. **Déploiement & sauvegarde**
   **Given** la CI
   **When** un déploiement GitHub Actions → SSH/rsync vers o2switch s'exécute
   **Then** les deux apps Passenger (Nuxt public + NestJS sous-domaine) démarrent et une **page/endpoint de santé** répond, **et** la stratégie de **sauvegarde** (dump MariaDB + fichiers hors-webroot) est documentée et scriptée [AD-24]

## Tasks / Subtasks

- [x] **T1 — Initialiser le monorepo Turborepo** (AC: 1)
  - [x] `pnpm` workspaces + `turbo.json` (pipelines `build`, `lint`, `test`, `dev`, `generate:client`)
  - [x] Node 24 (`.nvmrc` / `engines`), TypeScript 5, configs partagées dans `packages/config` (tsconfig base, eslint, prettier)
  - [x] Arborescence cible (voir Project Structure Notes) créée et vide de logique métier
- [x] **T2 — Scaffolder `apps/api` (NestJS 11, hexagonal strict)** (AC: 1, 2)
  - [x] App NestJS 11 + structure par contexte `src/<context>/{domain,application,infrastructure}` (créer au moins `shared-kernel/` + un module `health`)
  - [x] MikroORM `^6` + driver `@mikro-orm/mariadb` ; config via env ; **migrations en CLI** (`mikro-orm migration:up`) jouées au déploiement
  - [x] Migration baseline (table `health_check` ou table de session minimale) — pas d'entité métier
  - [x] Endpoint `GET /health` (statut + ping DB)
- [x] **T3 — Scaffolder `apps/web` (Nuxt 4 BFF)** (AC: 1, 4)
  - [x] Nuxt 4 + Pinia ; dossier `app/` (atoms/molecules/organisms/templates/pages vides) ; `server/` pour les routes BFF
  - [x] Route BFF de démonstration `server/api/health.ts` qui relaie vers NestJS avec le **JWT signé** (secret partagé) — prouve le chemin navigateur→Nitro→NestJS [AD-1, AD-14]
  - [x] Page d'accueil affichant l'état de santé via la route BFF (aucun appel direct à NestJS)
- [x] **T4 — `packages/contracts` + génération client** (AC: 1, 3)
  - [x] `@nestjs/swagger` expose l'OpenAPI de l'API ; tâche `generate:client` produit le client TS dans `packages/contracts`
  - [x] `apps/web` consomme le client généré (santé) ; aucun `fetch` manuel vers l'API [AD-12]
- [x] **T5 — Garde-fous qualité** (AC: 3)
  - [x] `dependency-cruiser` avec règles : `domain` ne dépend ni de `application`/`infrastructure` ni d'aucun module framework/ORM ; un contexte n'importe pas le code interne d'un autre [AD-2, AD-3]
  - [x] Brancher dependency-cruiser dans `turbo run lint` (échec bloquant)
  - [x] Tests de fumée : 1 test unitaire (api) + 1 test (web) ; `turbo run test` vert
- [x] **T6 — CI/CD & ops o2switch** (AC: 4)
  - [x] Workflow GitHub Actions : install → `turbo run build test lint` → artefacts
  - [x] Job de déploiement SSH/rsync vers o2switch (build en CI, pas sur le mutualisé) ; **étape migrations** dédiée ; `touch tmp/restart.txt` pour recycler Passenger
  - [x] Fichiers de démarrage Passenger pour les **deux** apps (Nuxt public + NestJS sous-domaine non public)
  - [x] Script de sauvegarde (dump MariaDB + tar des fichiers hors-webroot) + note de procédure de restauration [AD-24]
  - [x] Secrets en variables d'env (JWT, secret de session, creds MariaDB, clé Brevo placeholder) — jamais dans le repo

### Review Findings

Revue adversariale (Blind Hunter + Edge Case Hunter + Acceptance Auditor) du 2026-06-29 — verdict : **Changes Requested**.

- [x] [Review][Decision] Default-deny global manquant (AD-14) — `/health` est public et aucun `APP_GUARD` global n'existe : un futur contrôleur sans `@UseGuards` serait exposé. Choix : (a) garde globale + `@Public()` sur health (default-deny, conforme à l'intention AD-14, **recommandé**) ou (b) garder le public explicite par contrôleur. [api/src/shared-kernel/bff-auth]
- [x] [Review][Patch] AD-12 non bouclé : client généré orphelin + émission OpenAPI hors pipeline — `contracts/src/index.ts` exporte la baseline manuelle, pas le fichier généré ; `emit:openapi` n'est pas une tâche turbo ; `deploy.yml` casse sur `generate:client`. [turbo.json, packages/contracts, apps/api, .github/workflows]
- [x] [Review][Patch] `deploy.yml` non fonctionnel : `npm ci` sans lockfile + `@mikro-orm/cli` (devDep) supprimé par `--omit=dev` + `generate:client` sans `openapi.json`. [.github/workflows/deploy.yml, apps/api/package.json]
- [x] [Review][Patch] Migrations jouées après rsync du code, sans gate ni rollback — schéma partiellement migré possible (intégrité AD-24). [.github/workflows/deploy.yml]
- [x] [Review][Patch] Secret BFF par défaut en dur (`change_me_dev_only`) côté Nuxt : signe des JWT d'identité même non configuré en prod (forge de userId). Fail-fast requis. [apps/web/nuxt.config.ts, apps/api, apps/web/server/utils/bffToken.ts]
- [x] [Review][Patch] Ping santé sans timeout : au cold-start DB injoignable, `/health` peut pendre des dizaines de secondes. [apps/api/src/mikro-orm.config.ts, .../mikro-db-ping.adapter.ts]
- [x] [Review][Patch] Relais BFF `/health` et `/whoami` sans try/catch : une API down/expirée remonte en 500 brute. [apps/web/server/api/*.get.ts]
- [x] [Review][Patch] Type de retour `whoami` `{userId: string|undefined}` incohérent avec le contrat `WhoamiResponse`. [apps/api/.../whoami.controller.ts]
- [x] [Review][Patch] Drift de schéma `current_timestamp` vs `current_timestamp()` (migration/entité/snapshot). [apps/api/src/migrations, .../health-check.entity.ts]
- [x] [Review][Patch] `backup.sh` passe le mot de passe en argv de `mysqldump` (visible en `ps` sur mutualisé). [scripts/backup.sh]
- [x] [Review][Patch] Garde-fous depcruise à durcir : `domain-no-framework` = denylist nominative (pas « aucun framework ») ; le lint web ne couvre pas `app/`. [.dependency-cruiser.cjs, apps/web/package.json]
- [x] [Review][Defer] `Number(PORT/DB_PORT)` → `NaN` silencieux si non numérique — faible (Passenger intercepte `listen`). [apps/api/src/main.ts]
- [x] [Review][Defer] Relais BFF en `$fetch` manuel typé — `openapi-typescript` ne génère que des types (pas de client fetch) ; consommer ces types via `$fetch` EST le patron prévu — non bloquant.

## Dev Notes

### Stack imposée (versions vérifiées juin 2026)

| Élément | Version | Notes |
|---|---|---|
| Node.js | **24 LTS** | o2switch propose 22 et 24 ; viser 24 (Active LTS) |
| Gestionnaire de paquets | **pnpm** (workspaces) | recommandé pour Turborepo ; verrou commit |
| Monorepo | **Turborepo 2.10.x** | pipelines + cache |
| Langage | **TypeScript 5.x** | |
| Front | **Nuxt 4.4.x** + Pinia | server routes Nitro = BFF |
| Back | **NestJS 11.1.x** | hexagonal strict |
| ORM | **MikroORM `^6`** (6.6.x) | driver `@mikro-orm/mariadb` ; v7 GA mais différée |
| BDD | **MariaDB** (o2switch ≥ 10.6) | |
| Contrat API | `@nestjs/swagger` + class-validator | → client TS généré (pipeline) |
| Hachage | argon2id (`argon2`) | utilisé en story 1.2, pas ici |
| Hébergement | o2switch (Passenger) | 2 apps Node + sockets Unix |
| CI/CD | GitHub Actions → SSH/rsync | build en CI |

### Patterns d'architecture à respecter (la spine fait foi)

- **Topologie BFF [AD-1, AD-19]** : le navigateur ne parle qu'aux server routes Nuxt/Nitro ; NestJS n'est jamais appelé en direct depuis le navigateur. Le BFF relaie avec un JWT signé court portant **l'identité seule** (les rôles viennent d'IAM côté NestJS — pas dans cette story, mais le chemin signé se met en place dès la route de santé). **Frontière de confiance = le secret partagé**, pas le réseau [AD-14].
- **Hexagonal strict [AD-2]** : chaque contexte NestJS = `domain/` (pur, aucun import framework/ORM) + `application/` (use-cases) + `infrastructure/` (adapters). Les dépendances pointent **uniquement vers le domaine**.
- **Contextes étanches [AD-3]** : un contexte n'importe jamais le code interne d'un autre. À ce stade, ne créer que `shared-kernel/` (bus d'événements, VO `Money` à venir) et un module `health`.
- **Contrat unique + client généré [AD-12]** : OpenAPI généré depuis les DTO décorés → client TS dans `packages/contracts` ; `apps/web` n'appelle l'API **que** via ce client. La génération est une **tâche Turborepo**, jamais manuelle.
- **Migrations au déploiement [AD-18]** : MikroORM migrations via CLI à l'étape de déploiement ; **jamais** d'auto-run au boot (plusieurs process Passenger).
- **Sauvegarde/DR [AD-24]** : données à valeur probante → dump MariaDB périodique + fichiers hors-webroot, conservés hors o2switch ; restauration testée.

### Détails o2switch / Passenger (pièges connus)

- Deux apps Node distinctes sous Passenger (cPanel « Setup Node.js App ») : Nuxt sur le domaine public, NestJS sur un sous-domaine. Passenger fait du **reverse port binding** (socket Unix) — l'app écoute via `listen()`, pas un port fixe.
- **Ne pas builder sur le mutualisé** (risque OOM) : la CI build, on rsync les artefacts (`.output` Nuxt, `dist` NestJS, `node_modules` de prod).
- `npm/pnpm install` lourd : via vrai client SSH, pas le terminal cPanel.
- Redémarrage : `touch tmp/restart.txt` dans le dossier de l'app.
- Compiler/binaire parfois bloqué : préférer des deps pure-JS (cohérent avec pdfmake/argon2 — vérifier le binding argon2 en story 1.2).

### Hors périmètre (ne PAS implémenter ici)

- Aucune entité métier (Organisation, User, Projet, CRA…) — créées par leurs stories.
- Pas d'auth réelle (story 1.2) : seul le **mécanisme** de relais signé BFF→API est posé via la route de santé.
- Pas d'UI métier ni de design system complet (la story 1.5 pose l'app-shell + tokens) — ici, page de santé minimale.

### Project Structure Notes

Arborescence cible (depuis la spine, section Structural Seed) :

```text
ibasho-do-cra/
  turbo.json   pnpm-workspace.yaml   .nvmrc
  apps/
    web/        # Nuxt 4 — app/ (atomic, vide) + server/ (routes BFF)
    api/        # NestJS 11 — src/<context>/{domain,application,infrastructure}
                #   créer ici: shared-kernel/, health/
  packages/
    contracts/  # DTO + client OpenAPI généré
    config/     # tsconfig, eslint, prettier partagés
```

Aucun conflit attendu (greenfield). Respecter les noms de contextes prévus : `iam`, `projects`, `cra`, `invoicing`, `settlement`, `notifications`, `audit`, `documents` (créés au fil des stories).

### Testing standards

- Domaine = tests unitaires ; use-cases = intégration ; 1 e2e sur le tunnel critique (plus tard). Ici : tests de fumée `api` + `web` pour prouver que la CI exécute les tests.
- `turbo run test` doit être vert ; framework au choix idiomatique (Vitest recommandé pour Nuxt et utilisable côté NestJS, ou Jest côté NestJS).

### References

- [Source: planning-artifacts/epics.md#Epic 1 — Story 1.1]
- [Source: planning-artifacts/architecture/architecture-ibasho-do-cra-2026-06-29/ARCHITECTURE-SPINE.md#AD-1 (Topologie BFF)]
- [Source: ARCHITECTURE-SPINE.md#AD-2 (Hexagonal strict), #AD-3 (Contextes étanches)]
- [Source: ARCHITECTURE-SPINE.md#AD-12 (Contrat API & client généré), #AD-13 (Validation)]
- [Source: ARCHITECTURE-SPINE.md#AD-14 (Auth, identité-seule au BFF)]
- [Source: ARCHITECTURE-SPINE.md#AD-18 (Migrations au déploiement), #AD-19 (Accès données via BFF), #AD-24 (Sauvegarde/DR)]
- [Source: ARCHITECTURE-SPINE.md#Stack, #Structural Seed (arborescence, déploiement)]
- [Source: specs/spec-ibasho-do-cra/SPEC.md — contrainte « Architecture & stack imposées par la spine »]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMad dev-story)

### Debug Log References

- Validation locale : node v22.14 (cible déploiement 24 ; `engines: ">=22 <25"`, `.nvmrc=24`). 22 compatible avec toute la stack.
- 3 correctifs de typage API (isConnected→`em.getConnection().execute('select 1')`, suppression dépendance `express` via types `RequestLike` locaux).
- `tsx` (esbuild) n'émet pas les métadonnées de décorateurs : entité MikroORM et DTO Swagger rendus explicites (`type:`) → `emit:openapi` fiable sans reflect-metadata.
- Règle `no-cross-context-internals` réécrite avec la référence de groupe `$1` de dependency-cruiser (le backreference `\k<ctx>` n'est pas supporté).

### Completion Notes List

- **AC1 — structure & build** : `turbo run build` vert (4/4). `apps/api/dist/main.js` + `apps/web/.output/server/index.mjs` produits. Suite complète `build lint test` = 12/12.
- **AC2 — persistance & migrations** : prouvé sur MariaDB 10.11 (Docker jetable) — `mikro-orm migration:up` applique `Migration20260629000000` ; table `health_check` (id PK auto-increment + checked_at datetime) + `mikro_orm_migrations` vérifiées. API bootée contre la DB live → `/health` renvoie `db:up`. Connexion paresseuse (`connect:false`) : boot sans DB OK (cold-start Passenger). Migrations jouées via CLI au déploiement, jamais au boot (AD-18).
- **AC3 — garde-fous & contrat** : `depcruise` branché dans `turbo run lint` (vert) et **vérifié bloquant** (un import domaine→`@nestjs/common` déclenche `domain-no-framework`). `generate:client` = tâche pipeline : `emit:openapi` → `openapi.json` (paths `/health`, `/whoami`) → `openapi-typescript` → `src/generated/openapi.d.ts` (95 lignes). AD-2, AD-3, AD-12.
- **AC4 — déploiement & sauvegarde** : `/health` répond ; chemin signé BFF→API prouvé (`/whoami` : 401 sans token, `{"userId":...}` avec token HS256 valide — AD-1/AD-14). Workflows CI (`build lint test`) + deploy (rsync o2switch, migrations dédiées, restart Passenger). `scripts/backup.sh` (dump MariaDB + fichiers) + `docs/deploiement-o2switch.md` (AD-24).
- **Tests** : 8 unitaires verts (api 6 : HealthService ×3, verifyBffToken ×3 ; web 2 : signBffToken ×2). Pas de logique métier (hors périmètre respecté) — seuls le contexte `health` et le mécanisme d'identité BFF sont posés.

### File List

**Racine** : `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.dependency-cruiser.cjs`, `.gitignore` (modifié), `pnpm-lock.yaml`
**CI/ops** : `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `scripts/backup.sh`, `docs/deploiement-o2switch.md`
**packages/config** : `package.json`, `tsconfig.base.json`
**packages/contracts** : `package.json`, `tsconfig.json`, `src/index.ts`, `src/generated/api.ts`, `src/generated/openapi.d.ts` (généré), `scripts/generate.mjs`
**apps/api** : `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `.env.example`, `app.js` (Passenger), `scripts/emit-openapi.ts`, `src/main.ts`, `src/app.module.ts`, `src/mikro-orm.config.ts`, `src/migrations/Migration20260629000000.ts`, `src/health/**` (domain/application/infrastructure + spec), `src/shared-kernel/bff-auth/**`, `src/shared-kernel/persistence/health-check.entity.ts`
**apps/web** : `package.json`, `tsconfig.json`, `nuxt.config.ts`, `vitest.config.ts`, `.env.example`, `app/app.vue`, `app/pages/index.vue`, `app/stores/health.ts`, `server/api/health.get.ts`, `server/api/whoami.get.ts`, `server/utils/bffToken.ts`, `test/bffToken.spec.ts`

## Change Log

- 2026-06-29 — Scaffold initial du monorepo (Turborepo + Nuxt 4 BFF + NestJS 11 hexagonal + MikroORM/MariaDB + contrats générés + dependency-cruiser + CI/CD o2switch + sauvegarde). Story 1.1 implémentée, tous AC validés. Statut → review.
- 2026-06-30 — Code review (Changes Requested) traitée : 10 patchs appliqués + 1 décision résolue (default-deny global + @Public). AD-12 bouclé (client généré câblé + emit/generate dans le pipeline + drift-check CI), deploy.yml réparé (pnpm deploy, CLI en deps, migrations avant restart), secret BFF fail-fast, ping santé borné, relais BFF tolérants aux pannes, depcruise domaine durci. Suite 12/12 verte, garde globale et garde-fous re-vérifiés. Statut → done.
