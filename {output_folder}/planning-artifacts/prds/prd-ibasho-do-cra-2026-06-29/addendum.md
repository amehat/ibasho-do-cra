# Addendum PRD — Détails pour l'architecture / le design

Détails sortis du PRD (le « comment » et la profondeur downstream) mais à conserver pour la conception.

## Contexte technique
- **Front** : Nuxt, atomic design. Design retenu : `ux/prototype-uiux-v2` (canvas ivoire `#F4F2ED`, navy `#14171E`, accent `#2C5BEF`, Outfit + Inter, calendrier à badges, système de boutons Tailwind-grade). Réf. design canonique : `prototype-uiux-v2/design-system/MASTER.md`.
- **Back** : NestJS, clean architecture.
- **BDD** : **MariaDB** (révisé en architecture, 2026-06-29). Le choix PostgreSQL initial a été abandonné : l'hébergement retenu (o2switch mutualisé) ne propose que PostgreSQL 9.6 (EOL, non upgradable) et en annonce le retrait probable, alors que MariaDB y est natif et maintenu. Aucune fonctionnalité PostgreSQL-spécifique n'est requise (le snapshot CRA passe en type JSON MariaDB). Voir `architecture/.../ARCHITECTURE-SPINE.md`.

## Pistes de modèle de données (indicatif, à valider en architecture)
- **Organisation** (type : prestataire | cliente) — a des membres et au moins un propriétaire d'orga.
- **Utilisateur** — appartient à une organisation ; peut cumuler des rôles.
- **Projet** — orga prestataire + orga cliente + mission (dates) + périodicité + paramétrage ; a un propriétaire de projet.
- **TJM** — entité bornée dans le temps liée au projet : `{ date_debut, date_fin, montant }`, plages non chevauchantes. Le calcul du montant d'un CRA résout le TJM applicable jour par jour.
- **CRA** — projet + période + lignes-jours `{ date, état: travaillé|demi|non_travaillé|congé|férié_travaillé }` + statut (machine à états) + horodatage de validation + valideur + **snapshot figé à la validation** `{ montant_total, tjm_appliqués, jours }`. Validé = immuable (aucun déverrouillage).
- **Membre** — un membre ayant agi est **désactivé**, jamais supprimé en dur (l'attribution « validé par X » doit survivre).
- **Facture** — fichier PDF déposé, lié à un CRA validé.
- **Règlement** — date réglé (payeur) + confirmation réception (prestataire), tous deux optionnels selon paramétrage.
- **Invitation** — email + côté (prestataire|client) + rôle + statut.
- **Journal d'audit** — événements de validation et changements de statut.

## Règle de confidentialité des prix (v2 — feature intermédiaire)
- **Avec intermédiaire** :
  - L'**intermédiaire** voit : TJM prestataire + sa marge + prix client.
  - Le **client** voit : le prix **avec** marge uniquement (jamais le TJM brut du prestataire).
  - Le **prestataire** voit : son **TJM** uniquement.
- **Sans intermédiaire** : prestataire et client voient le même prix.

## Module contrat collaboratif (v2)
Rédaction par section partagée · validation par section puis globale · export Word + PDF · signature en ligne du contrat (jugée « trop tôt » pour la v1).

## Signature électronique (note juridique)
v1 = Option A : validation par compte authentifié + horodatage, mention sur le PDF. Pas de valeur eIDAS avancée/qualifiée. À réévaluer si un client exige une signature à valeur probante renforcée.

## Décisions écartées / parkées
- Génération de facture : exclue (certification FR requise). Le produit ne fait que transmettre des factures déposées.
- Gestion d'absence formelle (remplaçant daté, forçage du dépôt sans validation) : parkée en v2 ; couverte en v1 par la possibilité d'avoir plusieurs valideurs/payeurs.
