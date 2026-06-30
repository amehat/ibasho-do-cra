---
title: "PRD — Gestionnaire de CRA"
status: final
created: 2026-06-29
updated: 2026-06-29
---

# PRD : Gestionnaire de CRA

## 1. Résumé & vision

Outil web qui dématérialise toute la chaîne administrative d'une mission de prestation : du compte rendu d'activité (CRA) mensuel jusqu'à la confirmation du règlement, en passant par la facture. Il remplace le circuit papier (saisie manuelle, scan, mails, impression, signature, renvoi) par un tunnel numérique simple, où chaque acteur a son compte et son interface.

**Problème central (chiffré).** Le délai de paiement négocié est de 7 jours, mais les allers-retours papier prennent ~15 jours : la paperasse coûte plus cher que le délai contractuel. Un couac (erreur de jour, mail perdu) survient environ 1 mois sur 3. La douleur est partagée entre prestataire et service administratif du client.

**Cible v1.** Un prestataire indépendant **en direct** avec son client, dans un cadre **multi-organisations** (organisation prestataire + organisation cliente). Le produit grandira ensuite vers les configurations avec intermédiaire et la gestion contractuelle (voir Hors périmètre).

## 2. Objectifs & critères de succès

- **Délai fin-de-mois → règlement reçu** ramené sous le délai contractuel négocié (≤ 7 jours), contre ~22 jours aujourd'hui.
- **Zéro aller-retour papier/scan/mail** pour un CRA standard.
- **Zéro erreur de jours** atteignant la facture (corrigées à la source par la saisie au fil de l'eau).
- **Adoption réelle** : le premier client utilise l'outil ≥ 3 mois consécutifs sans revenir au papier.
- **Autonomie du client** : valideur et payeur agissent seuls depuis l'alerte mail, sans relance manuelle.

**Contre-métriques (à surveiller).** La rapidité de validation ne doit pas dégrader la qualité (validations « à l'aveugle ») ; la simplicité revendiquée ne doit pas se traduire par des fonctions de traçabilité manquantes (audit des validations, historique des statuts).

## 3. Acteurs, organisations & droits

Le système est **multi-organisations**. Toute personne appartient à une organisation, côté prestataire ou côté client.

| Rôle | Périmètre | Droits clés |
|------|-----------|-------------|
| **Propriétaire d'organisation** | Une organisation | Ajoute/supprime les membres de son organisation, leur attribue des rôles. Gère les arrivées (2e valideur) et les départs. Existe pour les deux organisations dès la v1. |
| **Propriétaire de projet (admin)** | Un projet | Crée et configure le projet, invite et qualifie les membres des deux organisations, gère le paramétrage. Rôle par projet, cumulable. |
| **Prestataire** | Un projet | Saisit le CRA au fil du mois, dépose la facture, confirme la réception du règlement (si activé). |
| **Valideur** (orga cliente) | Un projet | Consulte le CRA, le valide ou l'invalide en entier avec commentaire. Sa validation vaut signature. |
| **Payeur** (orga cliente) | Un projet | Accède au CRA validé + facture, marque « réglé » (si activé), suit le règlement. |

**Règles de rôles**
- Un même utilisateur peut **cumuler** plusieurs rôles (ex. valideur + payeur).
- Plusieurs **valideurs** et plusieurs **payeurs** peuvent exister sur un projet ; n'importe lequel peut agir (couvre l'absence/les vacances en v1).
- En v1 : Arnaud = **propriétaire de projet + prestataire** ; son client a un valideur et un payeur (distincts chez son client réel, mais le cumul reste possible).

## 4. Périmètre v1

**Dans la v1** — le tunnel complet pour un prestataire en direct :
gestion des organisations et des membres · création et configuration de projet (parties, dates de mission, TJM bornés dans le temps, périodicité, paramétrage) · invitations qualifiées par email · saisie du CRA au fil du mois · soumission, validation/invalidation client · verrouillage + signature (Option A) · dépôt de facture lié au CRA validé + mise à disposition/notification du payeur · suivi optionnel du règlement · notifications email · tableau de bord « vue rapide ».

**Hors v1** — voir section 9.

## 5. Exigences fonctionnelles

Identifiants stables (FRn), regroupés par fonctionnalité.

### F1 — Organisations & membres
- **FR1** Le système gère des organisations, côté prestataire et côté client.
- **FR2** Chaque organisation possède au moins un propriétaire d'organisation.
- **FR3** Le propriétaire d'organisation peut ajouter et **désactiver** des membres de son organisation et leur attribuer des rôles (selon le côté : prestataire ; ou valideur/payeur). Un membre ayant déjà agi (validé, réglé) est **désactivé, jamais supprimé en dur** (préservation de l'attribution et de l'audit).
- **FR4** Un utilisateur peut cumuler plusieurs rôles.

### F2 — Projets, configuration & invitations
- **FR5** Un propriétaire de projet peut créer un projet (en v1, le prestataire).
- **FR6** Un projet associe une organisation prestataire, une organisation cliente, et une mission avec dates de début/fin.
- **FR7** Un projet définit un ou plusieurs **TJM bornés dans le temps** (« TJM de telle date à telle date »), la référence étant le **contrat**. Les contrats — donc les plages de TJM — **ne se chevauchent pas** : un seul TJM s'applique à une date donnée.
- **FR8** La périodicité du CRA est **paramétrable par projet** (défaut : mensuelle).
- **FR9** Le propriétaire de projet dispose d'une interface d'invitation : il qualifie l'invité (côté prestataire ou côté client), saisit son email, ce qui envoie un email d'invitation.
- **FR10** À la création du projet, le propriétaire de projet peut désigner un **valideur** et un **payeur** initiaux de l'organisation cliente.
- **FR32** L'invité reçoit un email contenant un lien ; il l'accepte, **crée son compte** (email + mot de passe) et est **automatiquement rattaché** à l'organisation et au rôle qualifiés dans l'invitation. (Condition d'entrée du client dans l'app.)
- **FR11** Le paramétrage du projet (dont l'activation des confirmations de règlement) est défini à la création et **modifiable à tout moment** par le propriétaire de projet.

### F3 — Saisie du CRA
- **FR12** Le prestataire saisit son CRA **au fil de la période** (mensuelle par défaut, voir FR8) ; chaque jour prend un état : travaillé / demi-journée / non travaillé / congé / **férié travaillé**. Week-ends et fériés sont pré-marqués mais forçables.
- **FR13** La saisie est **auto-enregistrée** en brouillon (aucune perte).
- **FR14** Le montant du CRA est recalculé en continu : somme par jour de (fraction de jour × TJM applicable à la date).
- **FR15** Le prestataire **soumet** le CRA via une action explicite (avec confirmation). La soumission est **bloquée** si un jour travaillé n'est couvert par aucun TJM (FR7), ou si le CRA ne comporte **aucun jour travaillé** (un CRA à 0 jour ne peut être ni soumis ni validé).

### F4 — Soumission & validation
- **FR16** La soumission **notifie le(s) valideur(s)**.
- **FR17** Le valideur consulte le CRA (interface de validation, lecture seule) et peut le **valider** ou l'**invalider en entier avec un commentaire obligatoire** (pas de contestation jour par jour). En présence de plusieurs valideurs, la **première validation l'emporte** et verrouille le CRA.
- **FR18** Une invalidation **notifie le prestataire**, rouvre le CRA en édition avec le commentaire affiché ; après correction, il est re-soumis.
- **FR19** Un CRA validé est **verrouillé, horodaté et définitivement immuable** : il n'est plus modifiable et **n'est pas déverrouillable** (la validation est un engagement ferme). L'état validé est **affiché clairement sur l'interface** (bandeau verrouillé + mention « validé électroniquement par {valideur} le {date} »), pas seulement dans le PDF.
- **FR33** À la validation, le CRA **fige un instantané** (montant total, TJM appliqués, jours). Une modification ultérieure du TJM (FR11) **n'affecte aucun CRA déjà validé** ; le recalcul continu (FR14) ne s'applique qu'aux CRA non encore validés.

### F5 — Signature électronique (Option A)
- **FR20** La validation par le valideur authentifié **vaut signature électronique**, horodatée à son nom (Option A : pas de signature eIDAS avancée en v1).
- **FR21** Un **PDF** du CRA validé est généré avec la mention « validé électroniquement par {valideur} le {date} », téléchargeable.
- **FR22** Côté prestataire, la **soumission suffit** ; pas d'étape de signature séparée.

### F6 — Facture & transmission
- **FR23** Le prestataire **dépose une facture (PDF)** liée à un CRA. Le dépôt est **impossible tant que le CRA n'est pas validé** (invariant v1). Le prestataire peut **remplacer** (re-déposer) une facture déjà déposée, en cas d'erreur de document, **tant que le règlement n'est pas confirmé** ; le payeur est alors **re-notifié**.
- **FR24** Le **dépôt vaut transmission** : une seule action rend la facture disponible au payeur et le **notifie**.
- **FR25** Le payeur **consulte/télécharge** le CRA validé + la facture **depuis son interface** (documents in-app, jamais envoyés en pièce jointe email).
- **FR26** Le système **ne génère pas** de facture (la certification requise en France l'exclut ; définitif).

### F7 — Suivi du règlement
- **FR27** Le payeur peut marquer le CRA « **réglé** » (avec date) — étape **optionnelle**, activée par paramétrage.
- **FR28** Le prestataire peut confirmer la « **réception du règlement** » — étape **optionnelle**, activée par paramétrage.
- **FR29** Si activées, **les deux côtés voient l'avancement** de l'état de règlement.

### F8 — Notifications & alertes
- **FR30** Le système envoie des **emails d'alerte** qui renvoient vers l'app (le mail informe, l'action se fait dans l'interface) :
  - CRA soumis → valideur(s)
  - CRA invalidé → prestataire
  - CRA validé → **prestataire uniquement** (le payeur voit l'info sur son interface mais n'est pas notifié)
  - Facture déposée → **payeur uniquement**
  - « Réglé » → prestataire
  - « Réception confirmée » → payeur + valideur

### F9 — Tableau de bord & vue rapide
- **FR31** Chaque acteur dispose d'un tableau de bord listant ses CRA avec **statut visible** (pastille + libellé) et des indicateurs clés (jours du mois, montant, en attente de règlement). Objectif : « simple, avec une vue rapide ».

## 6. Cycle de vie du CRA

```
Brouillon (saisie au fil du mois, auto-save)
  → Soumis (notifie valideur)
    → [Invalidé + commentaire → notifie prestataire → correction → re-soumis]
    → Validé (verrouillé + horodaté ; vaut signature ; PDF généré ; notifie prestataire)
      → Facturé (facture PDF déposée ; possible seulement si Validé ; notifie payeur)
        → [Réglé (date, par payeur) ]   (optionnel, paramétrable)
          → [Réception confirmée (par prestataire)]   (optionnel, paramétrable)
```
Un CRA **Validé** est **définitivement immuable** (aucun déverrouillage). La seule correction possible en aval porte sur les **documents** : remplacer une facture erronée tant que le règlement n'est pas confirmé (FR23).

## 7. Exigences non-fonctionnelles

- **Authentification** : email + mot de passe (v1).
- **Sécurité & cloisonnement** : permissions strictes par rôle et par organisation ; chaque acteur ne voit que ce que son rôle autorise. Un membre retiré d'une organisation perd l'accès.
- **Traçabilité** : journal d'audit des validations et des changements de statut (qui, quoi, quand), notamment pour la valeur probante de la signature. L'**identité d'un signataire** (valideur) survit à son départ : désactivation, jamais suppression dure.
- **Signature** : valeur = compte authentifié + horodatage (Option A). La signature eIDAS avancée est hors v1.
- **Documents** : génération du PDF de CRA ; stockage et téléchargement des factures déposées ; conservation.
- **Langue** : interface en **français** (avec accents corrects).
- **UI/UX** : conforme au design retenu (`ux/prototype-uiux-v2`), responsive, accessible (WCAG AA), statut lisible partout (jamais par la couleur seule).
- **Performance & simplicité** : la « vue rapide » se charge quasi instantanément ; le tunnel reste sans rupture.
- **Contexte technique** : Nuxt (atomic design) / NestJS (clean architecture) / PostgreSQL — détails dans `addendum.md`.

## 8. Hypothèses & questions ouvertes

- Confirmé : plages de TJM non chevauchantes (FR7) ; dépôt de facture seulement si CRA validé et dépôt = transmission (FR23-FR24) ; authentification email + mot de passe (NFR) ; Option A suffisante pour le premier client.
- À préciser ultérieurement : politique de conservation des documents ; réévaluation de la valeur probante de la signature si un futur client exige une signature renforcée.

## 9. Hors périmètre v1 (vision / v2)

- **Rôle intermédiaire** + logique de **marge** (%) et **confidentialité des prix** selon les rôles (détail conservé dans `addendum.md`).
- **Module contrat collaboratif** : rédaction par section, validation partielle/globale, export Word + PDF, **signature en ligne du contrat**.
- **Synthèses / tableaux de bord avancés** (coût et jours travaillés pluriannuels).
- **Gestion d'absence formelle** : remplaçant désigné sur une plage de dates ; option pour forcer le dépôt de facture sans validation.
- **Signature eIDAS avancée**.
- **Génération de facture** : exclue définitivement (certification requise).
