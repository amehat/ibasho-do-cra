---
id: SPEC-ibasho-do-cra
companions:
  - ../../planning-artifacts/architecture/architecture-ibasho-do-cra-2026-06-29/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/ux/ux-design.md
  - ../../planning-artifacts/ux/prototype-uiux-v2/design-system/MASTER.md
sources:
  - ../../planning-artifacts/prds/prd-ibasho-do-cra-2026-06-29/prd.md
  - ../../planning-artifacts/prds/prd-ibasho-do-cra-2026-06-29/addendum.md
  - ../../planning-artifacts/briefs/brief-ibasho-do-cra-2026-06-29/brief.md
---

> **Contrat canonique.** Ce SPEC et les fichiers de `companions:` forment le contrat complet, validé en préservation, de ce qu'il faut construire, tester et valider. Les `sources:` ne servent qu'à la traçabilité — à consulter seulement pour la justification narrative que ce contrat omet volontairement.

# Gestionnaire de CRA — v1

## Why

**Une douleur à résoudre, sur une niche mal servie.** Chaque mois, un prestataire indépendant en télétravail remplit son compte rendu d'activité (CRA) à la main, le scanne, l'envoie par mail, attend que le client l'imprime/signe/renvoie, puis édite et transmet sa facture au service administratif. Ce circuit papier prend **~15 jours** alors que le délai de paiement négocié est de **7 jours** — la paperasse coûte plus cher que le délai contractuel — avec un couac (erreur de jour, mail perdu) **environ 1 mois sur 3**, douleur partagée entre prestataire et service administratif du client. Les outils existants (type ESN/intermédiaire) servent mal le **prestataire solo en direct** : indisponibles, chers ou surdimensionnés. La v1 vise précisément ce segment, avec un tunnel numérique simple — saisie au fil du mois, validation client en un clic, CRA verrouillé/horodaté valant signature, puis facture et suivi du règlement — pour être payé **avant l'échéance négociée** et ne plus jamais imprimer ni scanner. L'avantage durable est l'exécution et l'intégration bout-en-bout (CRA + facture + règlement en un seul endroit), pas une rupture technologique.

## Capabilities

- **CAP-1 — Organisations & membres**
  - **intent:** Gérer des organisations (côté prestataire et côté client) et leurs membres, avec rôles cumulables, pour que chaque acteur agisse dans son périmètre.
  - **success:** Un propriétaire d'organisation ajoute un membre, lui attribue un ou plusieurs rôles, et **désactive** (jamais ne supprime) un membre ayant déjà agi ; l'attribution « validé par X » reste lisible après désactivation.

- **CAP-2 — Projets, TJM & invitations**
  - **intent:** Créer et configurer un projet (organisations prestataire/cliente, dates de mission, périodicité, TJM bornés dans le temps, paramétrage) et y faire entrer le client par invitation qualifiée.
  - **success:** Un propriétaire de projet définit des plages de TJM **non chevauchantes**, modifie le paramétrage à tout moment, et envoie une invitation par email ; l'invité crée son compte et est **automatiquement rattaché** à l'organisation et au rôle qualifiés.

- **CAP-3 — Saisie du CRA au fil de l'eau**
  - **intent:** Saisir le CRA jour par jour pendant la période, chaque jour prenant un état (travaillé / demi-journée / non travaillé / congé / férié travaillé), avec week-ends et fériés pré-marqués mais forçables.
  - **success:** Chaque modification est **auto-enregistrée** en brouillon sans perte, le montant (Σ fraction de jour × TJM applicable) est **recalculé en continu**, et la saisie reste éditable tant que non validée.

- **CAP-4 — Soumission & validation client**
  - **intent:** Permettre au prestataire de soumettre le CRA et au valideur de le valider ou l'invalider en entier.
  - **success:** La soumission notifie le(s) valideur(s) ; une invalidation exige un **commentaire obligatoire**, rouvre le CRA en édition côté prestataire et le notifie ; en présence de plusieurs valideurs, la **première validation l'emporte et verrouille**. La soumission est **bloquée** si un jour travaillé n'est couvert par aucun TJM ou si le CRA ne comporte aucun jour travaillé.

- **CAP-5 — Validation = signature & immuabilité**
  - **intent:** Faire de la validation par le client authentifié une signature électronique horodatée, figeant définitivement le CRA.
  - **success:** À la validation, le CRA **fige un snapshot** (montant, TJM appliqués, jours) + horodatage + valideur, devient **verrouillé et définitivement immuable** (aucun déverrouillage, pas même admin), affiche son état « validé électroniquement par {valideur} le {date} », et un **PDF** téléchargeable est généré avec cette mention.

- **CAP-6 — Facture & transmission**
  - **intent:** Déposer une facture (PDF) liée à un CRA validé et la transmettre au payeur.
  - **success:** Le dépôt est **impossible tant que le CRA n'est pas validé** ; le **dépôt vaut transmission** (une action rend la facture disponible au payeur in-app et le notifie) ; le prestataire peut **remplacer** la facture tant que le règlement n'est pas confirmé (re-notifie). Le système ne génère jamais de facture.

- **CAP-7 — Suivi du règlement**
  - **intent:** Suivre le règlement de bout en bout quand le projet l'active.
  - **success:** Si activé par paramétrage, le payeur marque le CRA « réglé » (avec date) et le prestataire confirme la « réception du règlement » ; les deux côtés voient l'avancement de l'état de règlement.

- **CAP-8 — Notifications d'alerte**
  - **intent:** Alerter chaque acteur par email d'une activité qui le concerne, l'action se faisant dans l'app.
  - **success:** Les emails partent selon la matrice de routage (CRA soumis → valideur(s) ; invalidé → prestataire ; validé → prestataire seul ; facture déposée → payeur seul ; réglé → prestataire ; réception confirmée → payeur + valideur) et renvoient vers l'interface ; aucune pièce jointe de document.

- **CAP-9 — Tableau de bord & vue rapide**
  - **intent:** Donner à chaque acteur une vue immédiate de ses CRA et de leur état.
  - **success:** Un tableau de bord liste les CRA avec **statut visible** (pastille + libellé + icône, jamais la couleur seule) et indicateurs clés (jours du mois, montant, en attente de règlement), lisibles en moins de deux secondes.

## Constraints

- **Immuabilité absolue du CRA validé** : verrouillé, horodaté, **jamais déverrouillable** (pas même par un admin). La seule correction aval porte sur la facture (remplacement tant que non réglé).
- **Snapshot figé à la validation** : une modification ultérieure du TJM n'affecte aucun CRA déjà validé ; le recalcul continu ne vaut que pour les CRA non validés.
- **TJM bornés dans le temps et non chevauchants** : un seul TJM s'applique à une date donnée.
- **Pas de génération de facture** : exclue définitivement (certification requise en France) ; le produit ne fait que transmettre une facture déposée. **Dépôt = transmission**, et seulement si le CRA est validé.
- **Désactivation, jamais suppression dure** d'un membre ayant agi (préservation de l'attribution et de la valeur probante).
- **Cloisonnement strict par rôle et par organisation** : chaque acteur ne voit que ce que son rôle autorise ; un membre retiré perd l'accès.
- **Signature = Option A** : compte authentifié + horodatage + mention sur le PDF ; pas de signature eIDAS avancée en v1.
- **Authentification email + mot de passe** en v1.
- **Documents in-app uniquement**, jamais envoyés en pièce jointe email.
- **Interface française** (accents corrects), **WCAG AA**, statut **jamais porté par la seule couleur**, responsive.
- **Architecture & stack imposées par la spine** (companion `ARCHITECTURE-SPINE.md`) : Nuxt / NestJS / **MariaDB**, hexagonal strict, BFF Nuxt, événements de domaine, outbox transactionnel, données monétaires en `Money` centimes EUR. Les décisions citables sont `AD-1` à `AD-24`.
- **Un seul CRA par (projet, période)** ; soumission bloquée sans jour travaillé couvert par un TJM.

## Non-goals

- **Rôle intermédiaire** + logique de marge (%) et confidentialité des prix selon les rôles.
- **Module contrat collaboratif** (rédaction par section, validation partielle/globale, export Word/PDF, signature en ligne du contrat).
- **Synthèses / tableaux de bord avancés** (coût et jours travaillés pluriannuels).
- **Gestion d'absence formelle** (remplaçant désigné sur une plage de dates ; forçage du dépôt sans validation) — couverte en v1 par la possibilité de plusieurs valideurs/payeurs.
- **Signature eIDAS avancée**.
- **Génération de facture** — exclue définitivement.

## Success signal

Le délai **fin-de-mois → règlement reçu** passe **sous le délai contractuel négocié (≤ 7 jours)**, contre ~22 jours aujourd'hui, **sans aucun aller-retour papier/scan/mail** pour un CRA standard. Preuve d'adoption : le premier client utilise l'outil **≥ 3 mois consécutifs** sans revenir au papier, valideur et payeur agissant seuls depuis l'alerte mail, sans relance manuelle.

## Assumptions

- Contre-métriques à surveiller (issues du PRD) : la rapidité de validation ne doit pas produire de validations « à l'aveugle », et la simplicité ne doit pas amputer la traçabilité (audit des validations, historique des statuts) — non bloquant pour la v1 mais à garder en vue.
