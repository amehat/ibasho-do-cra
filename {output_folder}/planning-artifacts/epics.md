---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "{output_folder}/specs/spec-ibasho-do-cra/SPEC.md"
  - "{output_folder}/planning-artifacts/architecture/architecture-ibasho-do-cra-2026-06-29/ARCHITECTURE-SPINE.md"
  - "{output_folder}/planning-artifacts/ux/ux-design.md"
  - "{output_folder}/planning-artifacts/ux/prototype-uiux-v2/design-system/MASTER.md"
  - "{output_folder}/planning-artifacts/prds/prd-ibasho-do-cra-2026-06-29/prd.md"
  - "{output_folder}/planning-artifacts/prds/prd-ibasho-do-cra-2026-06-29/addendum.md"
  - "{output_folder}/planning-artifacts/briefs/brief-ibasho-do-cra-2026-06-29/brief.md"
---

# Gestionnaire de CRA - Epic Breakdown

## Overview

Découpage complet en epics et stories pour la v1 du Gestionnaire de CRA, décomposant les exigences du SPEC (CAP-1..9), du PRD (FR1-33 / NFR), de la spine d'architecture (AD-1..24) et du doc UX en stories implémentables. Chaque story citera ses `CAP-n`, `FR`, et `AD-n` pertinents.

## Requirements Inventory

### Functional Requirements

**F1 — Organisations & membres**
- FR1: Le système gère des organisations, côté prestataire et côté client.
- FR2: Chaque organisation possède au moins un propriétaire d'organisation.
- FR3: Le propriétaire d'organisation peut ajouter et **désactiver** des membres et leur attribuer des rôles ; un membre ayant agi est désactivé, jamais supprimé en dur.
- FR4: Un utilisateur peut cumuler plusieurs rôles.

**F2 — Projets, configuration & invitations**
- FR5: Un propriétaire de projet peut créer un projet (en v1, le prestataire).
- FR6: Un projet associe une organisation prestataire, une organisation cliente et une mission avec dates de début/fin.
- FR7: Un projet définit un ou plusieurs **TJM bornés dans le temps** ; les plages ne se chevauchent pas (un seul TJM par date).
- FR8: La périodicité du CRA est paramétrable par projet (défaut : mensuelle).
- FR9: Interface d'invitation : le propriétaire qualifie l'invité (côté prestataire/client) et saisit son email → email d'invitation.
- FR10: À la création, le propriétaire peut désigner un valideur et un payeur initiaux côté client.
- FR11: Le paramétrage du projet (dont l'activation des confirmations de règlement) est défini à la création et modifiable à tout moment.
- FR32: L'invité reçoit un lien, accepte, crée son compte (email + mot de passe) et est automatiquement rattaché à l'organisation et au rôle qualifiés.

**F3 — Saisie du CRA**
- FR12: Le prestataire saisit son CRA au fil de la période ; chaque jour : travaillé / demi-journée / non travaillé / congé / férié travaillé. WE et fériés pré-marqués mais forçables.
- FR13: La saisie est auto-enregistrée en brouillon (aucune perte).
- FR14: Le montant est recalculé en continu : Σ (fraction de jour × TJM applicable à la date).
- FR15: Soumission via action explicite (avec confirmation) ; **bloquée** si un jour travaillé n'est couvert par aucun TJM, ou si aucun jour travaillé.

**F4 — Soumission & validation**
- FR16: La soumission notifie le(s) valideur(s).
- FR17: Le valideur consulte (lecture seule) et valide ou invalide en entier avec commentaire obligatoire ; en multi-valideurs, la première validation l'emporte et verrouille.
- FR18: Une invalidation notifie le prestataire, rouvre le CRA en édition avec le commentaire affiché ; après correction, re-soumission.
- FR19: Un CRA validé est verrouillé, horodaté et définitivement immuable (aucun déverrouillage) ; état affiché clairement (bandeau + mention).
- FR33: À la validation, le CRA fige un instantané (montant, TJM appliqués, jours) ; une modification ultérieure du TJM n'affecte aucun CRA validé.

**F5 — Signature électronique (Option A)**
- FR20: La validation par le valideur authentifié vaut signature électronique horodatée à son nom.
- FR21: Un PDF du CRA validé est généré avec la mention « validé électroniquement par {valideur} le {date} », téléchargeable.
- FR22: Côté prestataire, la soumission suffit ; pas d'étape de signature séparée.

**F6 — Facture & transmission**
- FR23: Le prestataire dépose une facture (PDF) liée à un CRA ; impossible tant que le CRA n'est pas validé ; remplacement possible tant que le règlement n'est pas confirmé (re-notifie le payeur).
- FR24: Le dépôt vaut transmission : une action rend la facture disponible au payeur et le notifie.
- FR25: Le payeur consulte/télécharge le CRA validé + la facture depuis son interface (in-app, jamais en pièce jointe).
- FR26: Le système ne génère pas de facture (certification FR ; définitif).

**F7 — Suivi du règlement**
- FR27: Le payeur peut marquer le CRA « réglé » (avec date) — optionnel, activé par paramétrage.
- FR28: Le prestataire peut confirmer la « réception du règlement » — optionnel, activé par paramétrage.
- FR29: Si activées, les deux côtés voient l'avancement de l'état de règlement.

**F8 — Notifications & alertes**
- FR30: Emails d'alerte qui renvoient vers l'app, selon la matrice : CRA soumis → valideur(s) ; invalidé → prestataire ; validé → prestataire seul ; facture déposée → payeur seul ; réglé → prestataire ; réception confirmée → payeur + valideur.

**F9 — Tableau de bord & vue rapide**
- FR31: Chaque acteur dispose d'un tableau de bord listant ses CRA avec statut visible (pastille + libellé) et indicateurs clés (jours, montant, en attente de règlement).

### NonFunctional Requirements

- NFR1 (Authentification): email + mot de passe en v1 ; hachage argon2id ; rate-limit login (AD-14).
- NFR2 (Sécurité & cloisonnement): permissions strictes par rôle et par organisation ; accès dérivé de l'appartenance au projet ; un membre retiré perd l'accès (AD-10, AD-14).
- NFR3 (Traçabilité): journal d'audit des validations et changements de statut (qui/quoi/quand), écrit en transaction (AD-5) ; identité du signataire préservée (AD-11).
- NFR4 (Signature): valeur = compte authentifié + horodatage (Option A) ; pas d'eIDAS avancée en v1.
- NFR5 (Documents): génération PDF du CRA ; stockage et téléchargement des factures ; accès in-app authentifié, jamais d'URL publique (AD-16).
- NFR6 (Langue): interface en français, accents corrects, formats fr-FR.
- NFR7 (UI/UX): conforme au design `prototype-uiux-v2`, responsive, WCAG AA, statut lisible partout (jamais par la couleur seule).
- NFR8 (Performance & simplicité): la « vue rapide » se charge quasi instantanément ; tunnel sans rupture.
- NFR9 (Contexte technique): Nuxt / NestJS / MariaDB ; détails dans la spine.

### Additional Requirements

> Issus de la spine d'architecture (`ARCHITECTURE-SPINE.md`, AD-1..24). **Aucun starter template** : la fondation est un monorepo custom à scaffolder (impacte Epic 1, Story 1).

- ADD1 (Fondation monorepo): Monorepo **Turborepo 2.10** ; `apps/web` (Nuxt 4.4 + Pinia, atomic design + server routes BFF), `apps/api` (NestJS 11, hexagonal strict), `packages/contracts` (DTO + client OpenAPI généré), `packages/config`. Node 24 LTS, TypeScript 5. (AD-1, AD-2, AD-12, AD-19)
- ADD2 (Topologie BFF): navigateur ↔ Nuxt/Nitro (BFF, cookie httpOnly, session MariaDB) ↔ NestJS non public gardé par JWT signé portant l'identité seule ; IAM résout les rôles (AD-1, AD-14).
- ADD3 (Hexagonal strict par contexte): 8 modules NestJS étanches — `iam`, `projects`, `cra`, `invoicing`, `settlement`, `notifications`, `audit`, `documents` — domaine pur + ports + use-cases + adapters ; garde CI dependency-cruiser (AD-2, AD-3).
- ADD4 (Événements de domaine + livraison): bus in-process ; Audit synchrone (même tx), Notifications via **outbox transactionnel** + idempotence ; alimente la cloche in-app (AD-4, AD-5, AD-22).
- ADD5 (Propriété TJM): Projects possède les TJM (non chevauchants) ; CRA résout via port `TjmResolver` (AD-6).
- ADD6 (Machine à états CRA): transitions = méthodes d'agrégat ; auto-save sans transition ; unicité (projet, période) ; immuabilité par absence de méthode de déverrouillage ; snapshot de forme fixe ; PDF/facture dérivent du snapshot (AD-7, AD-8).
- ADD7 (Statut = projection): statut composite affiché reconstruit des événements (read-model) ; aucun contexte n'écrit le statut d'un autre (AD-21).
- ADD8 (Contrat API): DTO class-validator + @nestjs/swagger → OpenAPI → client TS généré (tâche du pipeline) ; front appelle l'API uniquement via le client généré ; validation au bord + métier dans les agrégats (AD-12, AD-13).
- ADD9 (Monétaire): VO `Money` centimes EUR, arrondi half-up à la ligne (AD-17).
- ADD10 (Documents & PDF): pdfmake 0.3 (pure-JS) ; PDF généré à la validation ; stockage disque hors webroot ; validation MIME/taille des dépôts (AD-15, AD-16).
- ADD11 (Email): Brevo `^5` transactionnel via l'outbox (AD-22).
- ADD12 (Ops o2switch): MariaDB (MikroORM ^6) ; migrations à l'étape de déploiement (jamais au boot) ; CI GitHub Actions → SSH/rsync ; secrets en env ; backup/DR (JetBackup + dump MariaDB + fichiers) (AD-18, AD-24).

### UX Design Requirements

> Issus de `ux/ux-design.md` et `prototype-uiux-v2/design-system/MASTER.md`.

- UX-DR1 (Design tokens): implémenter les tokens `prototype-uiux-v2` — canvas ivoire `#F4F2ED`, navy `#14171E`, accent `#2C5BEF`, Outfit + Inter ; 6 couleurs de statut sémantiques (brouillon/soumis/refusé/validé/facturé/réglé), chacune pastille + libellé + icône.
- UX-DR2 (App-shell): sidebar persistante repliable < 1024px (items par rôle : prestataire / client / admin), topbar (contexte projet/mois, fil d'ariane, avatar+rôle, cloche de notifications), deep-linking URL = état.
- UX-DR3 (Atoms): Button, Input, MoneyInput, DatePicker, Badge/StatusPill, Icon (Lucide), Tooltip, Checkbox, **DayCell**.
- UX-DR4 (Molecules): FormField, KpiStat, StatusPill, ProjectRow/PaymentRow, CalendarWeekRow, ActionBar, ConfirmDialog, RejectionNotice, LockBanner.
- UX-DR5 (Organisms/Templates): AppSidebar, Topbar, ProjectTable, ProjectForm, CraCalendar, CraSummaryHeader, CraReview, ValidationActions, InvoiceForm, PaymentTable ; templates DashboardLayout, FormPanelLayout, ReviewLayout.
- UX-DR6 (Écran Projets): table (tri + recherche, empty state) + formulaire de création (dates, TJM MoneyInput, périodicité), validation au blur.
- UX-DR7 (Écran Saisie CRA): grille calendrier mensuelle, DayCell cliquable cyclant l'état, peinture multi-jours, cibles ≥ 44px, bandeau KPI, total `tabular-nums` recalculé en direct, indicateur auto-save, CTA Soumettre + dialogue de confirmation, états brouillon/soumis/refusé/validé.
- UX-DR8 (Écran Validation client): en-tête contextuel, CRA lecture seule, action primaire « Valider » (dialogue rappelant valeur signature), action secondaire « Demander une correction » (message obligatoire), feedback succès.
- UX-DR9 (Écran CRA verrouillé): LockBanner non ambigu (« validé électroniquement par {client} le {date} »), grille figée, bouton Télécharger PDF.
- UX-DR10 (Écran Facture): dépôt de facture PDF (désactivé tant que CRA non validé, raison affichée), action « Transmettre », état de transmission affiché.
- UX-DR11 (Écran Règlement): synthèse par CRA facturé (montant, date transmission, date règlement, statut paiement), action « Confirmer la réception du règlement », KPI trésorerie « en attente de règlement ».
- UX-DR12 (Accessibilité & responsive): contraste AA, focus visible, ordre clavier = ordre visuel, labels visibles, cibles ≥ 44px, breakpoints 375/768/1024/1440, tables → cartes/scroll sur mobile, `prefers-reduced-motion`, transitions 150–250ms.

### FR Coverage Map

- FR1, FR2, FR3, FR4 → Epic 1 (organisations, membres, rôles, désactivation)
- FR5, FR6, FR7, FR8, FR9, FR10, FR11 → Epic 2 (projet, TJM, périodicité, paramétrage, invitations)
- FR32 → Epic 2 (acceptation invitation → création compte + rattachement ; utilise l'auth d'Epic 1)
- FR12, FR13, FR14, FR15 → Epic 3 (saisie au fil de l'eau, auto-save, calcul, soumission)
- FR16 → Epic 3 (soumission notifie le valideur ; mécanisme outbox/email établi ici)
- FR17, FR18, FR19 → Epic 4 (validation/invalidation, verrouillage immuable)
- FR20, FR21, FR22 → Epic 4 (signature Option A, PDF)
- FR33 → Epic 4 (snapshot figé à la validation)
- FR23, FR24, FR25, FR26 → Epic 5 (dépôt facture, transmission, consultation payeur)
- FR27, FR28, FR29 → Epic 6 (suivi du règlement)
- FR31 → Epic 6 (tableau de bord / vue rapide)
- FR30 → Epics 3–6 (notifications par événement ; matrice de routage complétée au fil des epics, mécanisme établi en Epic 3)

## Epic List

### Epic 1: Fondations, comptes & organisations
Mettre en place la fondation technique (monorepo Turborepo, app-shell Nuxt BFF, API NestJS hexagonale, MariaDB, CI/déploiement o2switch) et permettre à un utilisateur de créer un compte, se connecter, et gérer son organisation et ses membres avec rôles. À la fin, un prestataire dispose d'une app fonctionnelle, sécurisée et cloisonnée, où il gère son organisation.
**FRs covered:** FR1, FR2, FR3, FR4 · **CAP:** CAP-1 · **AD:** AD-1, AD-2, AD-3, AD-10, AD-11, AD-12, AD-13, AD-14, AD-18, AD-19, AD-23, AD-24 · **UX-DR:** UX-DR1, UX-DR2, UX-DR3, UX-DR4

### Epic 2: Projets, TJM & entrée du client
Permettre au prestataire de créer et configurer un projet complet (parties, dates de mission, périodicité, TJM bornés non chevauchants, paramétrage modifiable) et d'y faire entrer le client par invitation qualifiée par email, qui crée son compte et est rattaché à son rôle. À la fin, un projet est prêt et tous les acteurs (prestataire, valideur, payeur) sont dans l'app.
**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR32 · **CAP:** CAP-2 · **AD:** AD-6, AD-23, AD-22 (email d'invitation) · **UX-DR:** UX-DR5, UX-DR6

### Epic 3: Saisie & soumission du CRA
Permettre au prestataire de saisir son CRA au fil du mois sur une grille calendrier (états jour, fériés forçables), avec auto-save et montant recalculé en continu, puis de le soumettre — ce qui notifie le valideur. Établit le mécanisme de notifications (outbox + Brevo). À la fin, un CRA peut être saisi sans perte et soumis pour validation.
**FRs covered:** FR12, FR13, FR14, FR15, FR16 · **CAP:** CAP-3, CAP-4 (soumission) · **AD:** AD-5, AD-6, AD-7, AD-9, AD-17, AD-20, AD-22 · **UX-DR:** UX-DR7

### Epic 4: Validation, signature & verrouillage
Permettre au valideur de consulter le CRA et de le valider (vaut signature Option A horodatée) ou de le renvoyer en correction avec commentaire obligatoire. La validation fige le snapshot, verrouille le CRA de façon définitivement immuable, génère le PDF, et trace l'audit. À la fin, un CRA validé est un engagement signé, immuable et téléchargeable.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR33 · **CAP:** CAP-4 (validation), CAP-5 · **AD:** AD-3 (audit), AD-5, AD-7, AD-8, AD-16, AD-21 · **UX-DR:** UX-DR8, UX-DR9

### Epic 5: Facture & transmission
Permettre au prestataire de déposer une facture PDF liée à un CRA validé (impossible sinon) et de la transmettre au payeur en une action (dépôt = transmission), avec remplacement possible tant que non réglé. Le payeur consulte/télécharge CRA + facture in-app. À la fin, la facture circule sans email ni papier.
**FRs covered:** FR23, FR24, FR25, FR26 · **CAP:** CAP-6 · **AD:** AD-15, AD-16, AD-22 · **UX-DR:** UX-DR10

### Epic 6: Suivi du règlement & tableau de bord
Permettre, si le projet l'active, au payeur de marquer « réglé » (date) et au prestataire de confirmer la réception, les deux côtés voyant l'avancement ; et offrir à chaque acteur un tableau de bord « vue rapide » (statut visible, indicateurs clés, en attente de règlement). À la fin, le tunnel est bouclé de la saisie au règlement confirmé, avec visibilité immédiate.
**FRs covered:** FR27, FR28, FR29, FR31 · **CAP:** CAP-7, CAP-9 · **AD:** AD-21, AD-22 · **UX-DR:** UX-DR11, UX-DR12

## Epic 1: Fondations, comptes & organisations

Mettre en place la fondation technique et permettre à un utilisateur de créer un compte, se connecter, et gérer son organisation et ses membres.

### Story 1.1: Scaffold du monorepo & socle déployable

As a développeur de l'équipe,
I want un monorepo Turborepo avec l'app Nuxt (BFF), l'API NestJS hexagonale, les packages partagés, la base MariaDB et le pipeline de déploiement o2switch,
So that toute story suivante se construit sur une fondation cohérente, testée et déployable.

**Acceptance Criteria:**

**Given** un dépôt vide
**When** le scaffold est exécuté
**Then** `apps/web` (Nuxt 4 + Pinia, server routes BFF), `apps/api` (NestJS 11, structure `domain/application/infrastructure` par contexte), `packages/contracts` et `packages/config` existent et build via Turborepo (AD-1, AD-2, AD-12, AD-19)
**And** la connexion MariaDB via MikroORM fonctionne, une migration initiale s'applique à l'étape de déploiement (jamais au boot) (AD-18)
**And** `dependency-cruiser` échoue le lint si une couche viole la direction hexagonale, et la génération du client OpenAPI est une tâche du pipeline (AD-3, AD-12)
**And** un déploiement CI GitHub Actions → SSH/rsync vers o2switch sert une page de santé, et la stratégie de sauvegarde (dump MariaDB + fichiers) est documentée (AD-24)

### Story 1.2: Inscription & connexion par email/mot de passe

As a utilisateur,
I want créer un compte et me connecter,
So that j'accède à l'application de façon sécurisée.

**Acceptance Criteria:**

**Given** un visiteur non authentifié
**When** il s'inscrit avec email + mot de passe
**Then** le mot de passe est haché en argon2id et le compte est créé
**And** à la connexion, une session est créée côté serveur (cookie httpOnly, persistée en MariaDB) et le BFF ne porte que l'identité (AD-14)
**Given** des tentatives de connexion répétées
**When** le seuil est dépassé
**Then** le login est rate-limité (AD-14)

### Story 1.3: Création d'organisation avec propriétaire

As a utilisateur,
I want créer mon organisation (prestataire ou cliente),
So that je dispose d'un espace rattaché à un propriétaire.

**Acceptance Criteria:**

**Given** un utilisateur authentifié sans organisation
**When** il crée une organisation en précisant son type (prestataire | cliente)
**Then** l'organisation est créée avec lui comme propriétaire actif (FR1, FR2)
**And** l'organisation a toujours ≥ 1 propriétaire actif (AD-23)

### Story 1.4: Gestion des membres & rôles

As a propriétaire d'organisation,
I want ajouter des membres, leur attribuer des rôles cumulables, et désactiver ceux qui partent,
So that je gère mon équipe sans jamais perdre la traçabilité des actions passées.

**Acceptance Criteria:**

**Given** un propriétaire d'organisation
**When** il ajoute un membre et lui attribue un ou plusieurs rôles
**Then** le membre peut cumuler ces rôles (FR3, FR4)
**Given** un membre ayant déjà agi (validé/réglé/signé)
**When** le propriétaire veut le retirer
**Then** le membre est désactivé (jamais supprimé en dur), son attribution reste lisible, et il perd immédiatement l'accès (sessions invalidées) (FR3, AD-10, AD-11)
**Given** une organisation avec un seul propriétaire actif
**When** on tente de le retirer/désactiver
**Then** l'opération est refusée (AD-23)

### Story 1.5: App-shell & cloisonnement par rôle

As a utilisateur authentifié,
I want une navigation claire adaptée à mon rôle, ne montrant que ce à quoi j'ai droit,
So that je me repère vite et ne vois jamais ce qui ne me concerne pas.

**Acceptance Criteria:**

**Given** un utilisateur connecté
**When** l'app-shell se charge
**Then** la sidebar (repliable < 1024px) et la topbar affichent les items de son/ses rôle(s), avec les tokens design `prototype-uiux-v2` (ivoire/navy/accent, Outfit+Inter) (UX-DR1, UX-DR2)
**And** l'URL reflète l'état (deep-linking) et tout accès à une ressource de projet est refusé si l'acteur n'a pas le rôle requis sur ce projet (AD-10)
**And** les composants de base (Button, Input, MoneyInput, DatePicker, Badge/StatusPill, Icon Lucide) sont disponibles (UX-DR3, UX-DR4)

## Epic 2: Projets, TJM & entrée du client

Permettre au prestataire de créer et configurer un projet complet et d'y faire entrer le client par invitation.

### Story 2.1: Création d'un projet

As a propriétaire de projet (prestataire),
I want créer un projet associant les deux organisations et la mission,
So that le cadre de la prestation est posé.

**Acceptance Criteria:**

**Given** un prestataire authentifié
**When** il crée un projet (intitulé, organisation cliente, dates de mission début/fin, périodicité)
**Then** le projet est créé avec lui comme propriétaire de projet, périodicité par défaut mensuelle (FR5, FR6, FR8)
**And** le formulaire valide au blur avec labels visibles et types sémantiques (date, number) (UX-DR6)

### Story 2.2: TJM bornés non chevauchants

As a propriétaire de projet,
I want définir un ou plusieurs TJM avec leurs plages de dates,
So that le montant du CRA se calcule selon le bon taux à chaque date.

**Acceptance Criteria:**

**Given** un projet
**When** le propriétaire ajoute une plage de TJM (date début, date fin, montant)
**Then** le montant est stocké en `Money` centimes EUR et la plage est enregistrée (FR7, AD-17)
**Given** une nouvelle plage qui chevauche une plage existante
**When** elle est soumise
**Then** l'opération est refusée (plages non chevauchantes) et un port `TjmResolver.resolveForDate` permet de résoudre le TJM applicable à une date (FR7, AD-6)

### Story 2.3: Paramétrage du projet modifiable

As a propriétaire de projet,
I want configurer le projet et le modifier à tout moment,
So that j'active/désactive des options comme les confirmations de règlement.

**Acceptance Criteria:**

**Given** un projet existant
**When** le propriétaire modifie le paramétrage (dont activation des confirmations de règlement)
**Then** les changements s'appliquent immédiatement et n'affectent aucun CRA déjà validé (FR11, AD-8)

### Story 2.4: Désignation des acteurs & invitations qualifiées

As a propriétaire de projet,
I want désigner un valideur et un payeur initiaux et inviter des membres par email en les qualifiant,
So that le client rejoint le projet avec le bon rôle.

**Acceptance Criteria:**

**Given** un projet
**When** le propriétaire qualifie un invité (côté prestataire|client, rôle) et saisit son email
**Then** une invitation est créée et un email d'invitation est envoyé via l'outbox (FR9, FR10, AD-22)

### Story 2.5: Acceptation d'invitation → compte & rattachement

As a invité,
I want accepter l'invitation depuis le lien reçu,
So that je crée mon compte et accède directement à mon rôle sur le projet.

**Acceptance Criteria:**

**Given** un invité avec un lien valide
**When** il l'accepte et crée son compte (email + mot de passe)
**Then** il est automatiquement rattaché à l'organisation et au rôle qualifiés dans l'invitation (FR32, AD-23)
**And** un lien invalide/expiré est refusé proprement

## Epic 3: Saisie & soumission du CRA

Permettre au prestataire de saisir son CRA au fil du mois et de le soumettre.

### Story 3.1: Grille calendrier de saisie

As a prestataire,
I want saisir l'état de chaque jour sur une grille calendrier mensuelle,
So that mon CRA reflète mon activité réelle.

**Acceptance Criteria:**

**Given** un projet avec une période ouverte
**When** le prestataire ouvre la saisie
**Then** une grille mensuelle affiche une cellule par jour, cliquable entre les états travaillé / demi-journée / non travaillé / congé / férié travaillé (FR12, UX-DR7)
**And** week-ends et fériés (calculés côté serveur) sont pré-marqués mais forçables, cibles ≥ 44px, peinture multi-jours possible (FR12, AD-20)

### Story 3.2: Auto-save du brouillon

As a prestataire,
I want que ma saisie soit enregistrée automatiquement,
So that je ne perds jamais mon travail.

**Acceptance Criteria:**

**Given** un CRA en brouillon
**When** le prestataire modifie un jour
**Then** la modification est auto-enregistrée sans transition d'état, avec un indicateur « Enregistré » (FR13, AD-7)
**And** il existe au plus un CRA par (projet, période) (AD-7)

### Story 3.3: Calcul du montant en continu

As a prestataire,
I want voir le montant de mon CRA se mettre à jour à chaque saisie,
So that je connais immédiatement ce qui sera facturé.

**Acceptance Criteria:**

**Given** un CRA en brouillon avec des jours saisis
**When** un jour change
**Then** le montant = Σ (fraction de jour × TJM applicable résolu via TjmResolver), en `Money` centimes EUR, arrondi half-up à la ligne (FR14, AD-6, AD-17)
**And** un bandeau KPI affiche jours travaillés / demi-journées / montant en `tabular-nums` (UX-DR7)

### Story 3.4: Soumission du CRA & notification du valideur

As a prestataire,
I want soumettre mon CRA pour validation,
So that le client soit alerté et puisse le valider.

**Acceptance Criteria:**

**Given** un CRA en brouillon
**When** le prestataire clique « Soumettre »
**Then** une confirmation explicite est demandée, puis le CRA passe en « soumis » (transition d'agrégat) (FR15, AD-7)
**Given** un CRA dont un jour travaillé n'est couvert par aucun TJM, ou sans aucun jour travaillé
**When** la soumission est tentée
**Then** elle est bloquée avec un message clair (FR15)
**Given** une soumission réussie
**When** la transaction est committée
**Then** une notification est écrite dans l'outbox (même transaction) puis livrée au(x) valideur(s) par email via Brevo, avec clé d'idempotence, renvoyant vers l'app (FR16, FR30, AD-22, AD-5)

## Epic 4: Validation, signature & verrouillage

Permettre au valideur de valider (= signer) ou renvoyer en correction, en figeant le CRA validé.

### Story 4.1: Écran de validation en lecture seule

As a valideur,
I want consulter le CRA soumis dans une interface claire,
So that je décide en connaissance de cause.

**Acceptance Criteria:**

**Given** un valideur arrivant depuis l'alerte mail
**When** il ouvre l'écran de validation
**Then** il voit l'en-tête contextuel (prestataire, projet, mois, total jours, montant) et la grille en lecture seule, scannable (FR17, UX-DR8)
**And** l'accès est refusé s'il n'a pas le rôle valideur sur ce projet (AD-10)

### Story 4.2: Renvoi en correction avec commentaire obligatoire

As a valideur,
I want renvoyer le CRA en correction avec un message,
So that le prestataire corrige avant de re-soumettre.

**Acceptance Criteria:**

**Given** un CRA soumis
**When** le valideur choisit « Demander une correction » sans saisir de commentaire
**Then** l'action est bloquée tant que le commentaire obligatoire n'est pas renseigné (FR18, UX-DR8)
**Given** un commentaire renseigné
**When** il valide l'invalidation
**Then** le CRA repasse en édition côté prestataire avec le commentaire affiché, et le prestataire est notifié via l'outbox (FR18, AD-7, AD-22)

### Story 4.3: Validation = signature, snapshot & verrouillage immuable

As a valideur,
I want valider le CRA,
So that il devienne un engagement signé, figé et incontestable.

**Acceptance Criteria:**

**Given** un CRA soumis
**When** le valideur confirme la validation (dialogue rappelant qu'elle vaut signature)
**Then** le CRA fige un snapshot de forme fixe (montant_total_centimes, devise EUR, tjm_appliqués, jours), pose horodatage + valideur, passe « validé » et devient verrouillé (FR19, FR20, FR33, AD-7, AD-8)
**And** l'état validé est affiché clairement (bandeau « validé électroniquement par {valideur} le {date} ») et aucune méthode de déverrouillage n'existe (FR19, FR22, AD-8)
**Given** plusieurs valideurs agissant en concurrence
**When** deux validations arrivent
**Then** la première l'emporte via verrou optimiste, la seconde est rejetée (FR17, AD-7)
**And** une modification ultérieure du TJM n'affecte pas ce CRA validé (FR33, AD-8)

### Story 4.4: Génération du PDF du CRA validé

As a prestataire ou valideur,
I want télécharger le PDF du CRA validé,
So that j'ai une preuve documentaire de la validation.

**Acceptance Criteria:**

**Given** un CRA venant d'être validé
**When** la validation est committée
**Then** un PDF est généré (pdfmake) à partir du snapshot, portant la mention « validé électroniquement par {valideur} le {date} », et stocké sur disque hors webroot (FR21, AD-16)
**When** un acteur autorisé le demande
**Then** il le télécharge via un endpoint authentifié + autorisé (jamais d'URL publique) (FR21, AD-16)

### Story 4.5: Journal d'audit des validations

As a responsable de la traçabilité,
I want que chaque validation et changement de statut soit tracé,
So that la valeur probante de la signature soit assurée.

**Acceptance Criteria:**

**Given** une transition de statut (soumission, validation, invalidation)
**When** elle se produit
**Then** un événement d'audit (qui, quoi, quand) est écrit en synchrone dans la même transaction (NFR3, AD-5)
**And** l'identité de l'acteur reste lisible même après sa désactivation (AD-11)

## Epic 5: Facture & transmission

Permettre le dépôt et la transmission de la facture liée à un CRA validé.

### Story 5.1: Dépôt de facture lié à un CRA validé

As a prestataire,
I want déposer ma facture PDF rattachée à un CRA validé,
So that je transmette le bon document au payeur.

**Acceptance Criteria:**

**Given** un CRA non encore validé
**When** le prestataire tente d'accéder au dépôt de facture
**Then** l'action est désactivée avec la raison affichée (FR23, UX-DR10)
**Given** un CRA validé
**When** le prestataire dépose un fichier
**Then** le fichier est validé (type MIME PDF + taille bornée) et stocké hors webroot ; le système ne génère aucune facture (FR23, FR26, AD-15, AD-16)

### Story 5.2: Transmission au payeur

As a prestataire,
I want que le dépôt rende la facture disponible au payeur,
So that la transmission se fasse en une seule action.

**Acceptance Criteria:**

**Given** une facture déposée sur un CRA validé
**When** le dépôt est confirmé
**Then** la facture est disponible au payeur in-app, le payeur est notifié via l'outbox, et l'état « transmise le … » est affiché (FR24, AD-22)

### Story 5.3: Remplacement de facture tant que non réglé

As a prestataire,
I want remplacer une facture erronée,
So that je corrige un document tant que le règlement n'est pas confirmé.

**Acceptance Criteria:**

**Given** une facture transmise dont le règlement n'est pas confirmé
**When** le prestataire dépose une nouvelle version
**Then** elle remplace la précédente et le payeur est re-notifié (FR23, AD-22)
**Given** un règlement déjà confirmé
**When** le remplacement est tenté
**Then** il est refusé

### Story 5.4: Consultation par le payeur

As a payeur,
I want consulter et télécharger le CRA validé et la facture,
So that je traite le paiement avec les bons documents.

**Acceptance Criteria:**

**Given** un payeur sur un projet
**When** il ouvre un CRA facturé
**Then** il consulte/télécharge le CRA validé + la facture depuis son interface, via endpoint authentifié (jamais en pièce jointe email) (FR25, AD-16)

## Epic 6: Suivi du règlement & tableau de bord

Boucler le tunnel avec le suivi du règlement et la vue rapide par acteur.

### Story 6.1: Marquer « réglé » (payeur)

As a payeur,
I want marquer un CRA « réglé » avec une date,
So that le prestataire sache que le paiement est parti.

**Acceptance Criteria:**

**Given** un projet où le suivi du règlement est activé
**When** le payeur marque « réglé » (avec date)
**Then** l'état passe à « réglé » et le prestataire est notifié via l'outbox (FR27, AD-22)
**Given** un projet où l'option est désactivée
**Then** l'action n'est pas proposée (FR27)

### Story 6.2: Confirmer la réception du règlement (prestataire)

As a prestataire,
I want confirmer la réception du règlement,
So that le cycle soit clos pour les deux parties.

**Acceptance Criteria:**

**Given** un CRA marqué réglé (option activée)
**When** le prestataire confirme la réception
**Then** l'état passe à « reçu confirmé » (horodaté) et le payeur + le valideur sont notifiés via l'outbox (FR28, FR30, AD-22)

### Story 6.3: Visibilité de l'avancement du règlement

As a prestataire ou payeur,
I want voir l'avancement de l'état de règlement,
So that les deux côtés partagent la même information.

**Acceptance Criteria:**

**Given** un projet où le suivi est activé
**When** l'un ou l'autre acteur consulte un CRA facturé
**Then** il voit l'état de règlement courant (transmise / réglé / reçu), reconstruit depuis les événements (FR29, AD-21)

### Story 6.4: Tableau de bord « vue rapide »

As a acteur (prestataire, valideur, payeur),
I want un tableau de bord listant mes CRA avec leur statut et les chiffres clés,
So that je saisis l'essentiel en moins de deux secondes.

**Acceptance Criteria:**

**Given** un acteur connecté
**When** il ouvre son tableau de bord
**Then** ses CRA sont listés avec statut (pastille + libellé + icône, jamais la couleur seule), reconstruit depuis la projection d'événements (FR31, AD-20, AD-21)
**And** les indicateurs clés (jours du mois, montant, en attente de règlement) sont affichés en `tabular-nums` (FR31, UX-DR11)

### Story 6.5: Polish accessibilité & responsive

As a utilisateur sur tout appareil,
I want une interface accessible et adaptée à mon écran,
So that je l'utilise confortablement et sans barrière.

**Acceptance Criteria:**

**Given** n'importe quel écran de l'app
**When** il est audité
**Then** contraste AA, focus visible, ordre clavier = ordre visuel, labels visibles sont respectés (NFR7, UX-DR12)
**Given** les breakpoints 375 / 768 / 1024 / 1440
**When** la largeur change
**Then** la sidebar se replie sous 1024px et les tables basculent en cartes/scroll sur mobile, `prefers-reduced-motion` est respecté (UX-DR12)
