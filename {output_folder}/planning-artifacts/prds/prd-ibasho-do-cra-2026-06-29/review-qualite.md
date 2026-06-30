---
title: "Revue qualité — PRD Gestionnaire de CRA"
status: review
created: 2026-06-29
reviewer: "Relecteur PRD senior"
---

# Revue qualité du PRD v1 — Gestionnaire de CRA

## Verdict

**Prêt avec réserves.** Le PRD est clair, bien borné, et le tunnel principal (saisie → soumission → validation → facture → règlement) est cohérent et testable. Mais quelques trous de machine à états et d'edge cases mordraient **dès le premier mois réel** du premier client. Aucun n'implique d'élargir le périmètre : ce sont des précisions à ajouter sur des FR existants.

La revue se limite à ce qui compte. Le périmètre v1 serré est respecté ; je ne propose **aucune** feature parkée.

---

## 1. Complétude — trous dans la machine à états

### [CRITIQUE] Déverrouillage (FR19) sous-spécifié : état cible, facture déposée et PDF non traités
FR19 permet au propriétaire de projet de déverrouiller un CRA validé, mais :
- **Vers quel état** retombe le CRA ? Brouillon ? Soumis ? Le cycle de vie (§6) ne définit aucune transition sortante depuis `Validé`. C'est un trou dans la machine à états.
- **Sort de la facture** : FR23 garantit qu'une facture n'existe que sur un CRA validé. Si on déverrouille un CRA **après** dépôt de facture (FR24, déjà transmise au payeur), l'invariant FR23 est violé — la facture pend sur un CRA redevenu non-validé. Que devient-elle ? La notification déjà partie au payeur ?
- **Sort de la signature/PDF** (FR20-21) : le PDF « validé électroniquement par {valideur} le {date} » reste-t-il valable alors que le contenu peut changer ? La valeur probante (NFR Traçabilité) exige que l'ancien PDF soit invalidé/versionné.

➡️ Action : définir la transition `Validé → (déverrouillé)`, l'état cible, et le traitement de la facture + du PDF + de la nouvelle validation requise.

### [CRITIQUE] Flux d'onboarding manquant : invitation → création de compte → rattachement
FR9 envoie un email d'invitation et FR10 désigne valideur/payeur, mais **aucun FR ne couvre** ce qui se passe côté invité : création du compte (email + mot de passe, NFR auth), acceptation de l'invitation, rattachement au projet et au rôle. Sans cela, le tunnel ne **démarre** pas pour le client réel (le valideur/payeur ne peut pas entrer dans l'app). Edge associés non couverts : invitation expirée, ré-invitation, email invité appartenant déjà à une autre organisation (le modèle Addendum dit « un utilisateur appartient à **une** organisation »).

➡️ Action : ajouter un FR « cycle de l'invitation » (envoi → acceptation → création de compte → rattachement projet/rôle ; cas expirée/déjà-membre).

---

## 2. Cohérence interne (FR / NFR / machine à états)

### [CRITIQUE] Montant non figé à la validation : conflit FR14 / FR11 vs FR19
- FR14 : le montant est « recalculé **en continu** » = somme de (fraction × TJM applicable à la date).
- FR11 : le paramétrage du projet (dont les TJM, FR7) est « **modifiable à tout moment** ».
- FR19 : un CRA validé est « **immuable** ».

Ces trois règles se contredisent : si un TJM est édité/corrigé **après** la validation d'un CRA, le « recalcul en continu » modifie le montant d'un CRA censé être immuable et déjà signé/facturé. C'est exactement le cas « **changement de TJM rétroactif** ». 

➡️ Action : préciser que le montant **et** le TJM résolu jour par jour sont **figés (snapshot) au moment de la validation** ; le recalcul en continu ne s'applique qu'à l'état Brouillon/Soumis. Idem : interdire (ou tracer) une modification de TJM couvrant une période déjà validée.

### [MINEUR] « Au fil du mois » / « mensuel » codé en dur vs périodicité paramétrable
FR8 rend la périodicité paramétrable (défaut mensuel), mais FR12, FR13 et le §6 parlent de « CRA du mois » / « au fil du mois », et FR31 affiche « jours du mois ». Incohérence terminologique : si un client passe en hebdo/trimestriel, le vocabulaire et la pré-marque des week-ends/fériés doivent suivre.

➡️ Action : neutraliser le vocabulaire (« période » au lieu de « mois ») ou acter que la périodicité non-mensuelle n'est pas réellement testée en v1.

---

## 3. Permissions & sécurité (cloisonnement multi-orga / multi-rôle)

### [IMPORTANT] Auto-déverrouillage par le prestataire qui est aussi propriétaire de projet
En v1, Arnaud cumule **propriétaire de projet + prestataire** (FR43, FR4). Or seul le propriétaire de projet peut déverrouiller (FR19). Conséquence : le **prestataire peut, seul, casser une validation cliente**, rééditer le CRA et le re-soumettre — sans que le client le sache forcément. Cela vide en partie la valeur probante de la signature (NFR). Ce n'est pas un bug de cumul en soi, mais il manque un garde-fou.

➡️ Action : exiger qu'un déverrouillage soit **journalisé (audit) et notifié au valideur**, et qu'il **réinitialise la validation** (re-validation obligatoire avant re-facturation). Au minimum, le tracer comme événement de premier ordre.

### [IMPORTANT] Suppression d'un membre ayant validé : préservation de l'identité du signataire
FR3 autorise le propriétaire d'organisation à **supprimer** un membre ; la NFR dit « un membre retiré perd l'accès ». Mais FR20-21 attribuent la signature « validé électroniquement par **{valideur}** ». Si ce valideur est supprimé, l'attribution de la signature et la traçabilité (NFR) doivent **survivre** à la suppression. Le PRD ne dit pas si « supprimer » = soft-delete/désactivation conservant l'historique.

➡️ Action : préciser que la suppression d'un membre est une **désactivation** qui révoque l'accès **mais conserve** l'identité dans l'audit et les signatures passées. Interdire la suppression dure d'un membre référencé par une validation.

---

## 4. Edge cases réalistes (premiers mois du premier client)

### [IMPORTANT] Jour hors de toute plage de TJM (FR7 / FR14)
FR7 garantit des plages non chevauchantes, mais **pas couvrantes**. Si la mission (FR6) a des dates débordant les plages de TJM, ou s'il existe un trou entre deux contrats, un jour travaillé n'a **aucun TJM applicable** → montant indéterminé. FR14 ne dit pas quoi faire.

➡️ Action : définir le comportement (blocage de la soumission avec message, ou interdiction de saisir un jour travaillé hors plage TJM). C'est un cas qui survient au premier renouvellement de TJM mal borné.

### [IMPORTANT] Correction/remplacement d'une facture erronée
FR24 : « le dépôt **vaut transmission** » (une seule action, notifie le payeur). Aucun FR ne couvre le **mauvais PDF déposé** : pas de remplacement, pas d'annulation. Au premier upload raté, le prestataire est bloqué et le payeur a déjà été notifié.

➡️ Action : prévoir le remplacement d'une facture (re-dépôt) avant règlement, avec re-notification et trace d'audit.

### [MINEUR] CRA d'une période sans aucun jour travaillé (montant 0)
Rien ne dit si un CRA à 0 jour travaillé / 0 € peut être soumis et validé. Cas réel : mois entièrement en congé, ou mission démarrée en fin de mois. Comportement à acter (autoriser avec confirmation, ou bloquer).

### [MINEUR] Concurrence entre plusieurs valideurs/payeurs
FR42 autorise plusieurs valideurs, « n'importe lequel peut agir ». Deux valideurs agissant quasi simultanément (l'un valide, l'autre invalide) ne sont pas arbitrés. Faible probabilité en v1 (un seul valideur réel), mais à garder en tête.

➡️ Action : verrou optimiste « premier acte gagne » + message si l'état a déjà changé.

---

## 5. Testabilité

Globalement bonne (FR à identifiants stables, états énumérés, invariants explicites). Réserves mineures :
- FR31 / NFR Performance : « se charge **quasi instantanément** » n'est pas vérifiable. Donner un seuil (p.ex. < 1 s en charge nominale) — NFR, non bloquant.
- Les « objectifs » du §2 (délai ≤ 7 j, zéro erreur, adoption ≥ 3 mois) sont des **métriques de succès produit**, pas des exigences testables au build : bien les garder distincts des FR (c'est déjà le cas, juste à ne pas confondre en sprint planning).

---

## Synthèse par sévérité

| Sévérité | Constat | FR concerné |
|----------|---------|-------------|
| CRITIQUE | Déverrouillage sous-spécifié : état cible + facture déposée + PDF/signature non traités | FR19 (vs FR23/FR24/FR20-21) |
| CRITIQUE | Flux d'onboarding invité (acceptation → création compte → rattachement) absent | FR9/FR10 |
| CRITIQUE | Montant non figé à la validation → TJM rétroactif modifie un CRA immuable | FR14/FR11 vs FR19 |
| IMPORTANT | Auto-déverrouillage par le prestataire-aussi-admin sans garde-fou ni re-validation | FR19 + FR43 |
| IMPORTANT | Suppression d'un membre validateur vs préservation de l'identité du signataire | FR3/NFR vs FR20-21 |
| IMPORTANT | Jour travaillé hors de toute plage de TJM → montant indéterminé | FR7/FR14 |
| IMPORTANT | Pas de remplacement d'une facture erronée après transmission | FR23/FR24 |
| MINEUR | CRA à 0 jour travaillé : soumission autorisée ? | FR12/FR15 |
| MINEUR | « Mois » codé en dur vs périodicité paramétrable | FR8 vs FR12/§6 |
| MINEUR | Concurrence multi-valideurs non arbitrée | FR17/FR42 |
