# Addendum — Détails pour le PRD / l'architecture

Détails volontairement sortis du brief (trop fins pour un document de 1-2 pages) mais à conserver pour la conception en aval.

## Rôles & droits

| Rôle | Droits clés |
|------|-------------|
| **Prestataire** | Crée/saisit son CRA au fil du mois ; soumet ; confirme la réception du règlement ; voit son TJM. |
| **Client** | Consulte le CRA ; valide / invalide avec message ; sa validation authentifiée + horodatée vaut signature. |
| **Intermédiaire** *(v2)* | Se place entre prestataire et client ; ajoute une marge en % ; voit le prix avec marge. |
| **Admin (propriétaire de projet)** | Configure le projet, invite/qualifie les membres, gère le paramétrage. Ne peut pas modifier la validation d'un CRA. |

## Règle de confidentialité des prix (v2 — feature intermédiaire)

- **Avec intermédiaire** :
  - L'**intermédiaire** voit : TJM prestataire + sa marge + prix client.
  - Le **client** voit : le prix **avec** marge uniquement (jamais le TJM brut du prestataire).
  - Le **prestataire** voit : son **TJM** uniquement (ni la marge, ni le prix client final).
- **Sans intermédiaire** : prestataire et client voient **le même prix**.

## Cycle de vie du CRA

`Brouillon (saisie au fil du mois) → Soumis → [Validé | Invalidé+message → correction → re-soumis] → Validé = verrouillé/horodaté → Facturé → Transmis (service admin) → Réglé (date) → Règlement confirmé (prestataire)`

- Un CRA **validé** est **définitivement immuable** (aucun déverrouillage, y compris par l'admin).
- La validation client authentifiée + horodatée fait foi (Option A — pas de signature électronique eIDAS en v1).

## Module contrat collaboratif (v2)

- Rédaction **par section**, en mode partagé.
- Validation **par section** puis validation **globale**.
- Export **Word** et **PDF**.
- **Signature en ligne** du contrat (explicitement jugée « trop tôt » pour la v1 ; le contrat du premier client est géré hors app).

## Contexte technique (donné par l'utilisateur)

- **Front** : Nuxt, atomic design.
- **Back** : NestJS, clean architecture.
- **BDD** : PostgreSQL.

## Synthèses / tableaux de bord (v2)

- Coût cumulé, jours travaillés sur l'année, historique pluriannuel — la « vue rapide » évoquée.
