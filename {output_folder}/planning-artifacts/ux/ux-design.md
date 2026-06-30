---
title: "UX Design — Gestionnaire de CRA (v1)"
status: draft
created: 2026-06-29
updated: 2026-06-29
---

# UX Design — Gestionnaire de CRA (v1)

Spécifications UX des écrans v1. S'appuie sur `prototype-uiux-v2/design-system/MASTER.md` (tokens, style, typo — direction validée : canvas ivoire `#F4F2ED`, navy, accent `#2C5BEF`, Outfit + Inter). Périmètre = tunnel prestataire ↔ client en direct (voir le brief). Implémentation prévue avec `taste-skill` (Nuxt + atomic design).

## Principes transverses

1. **Le statut d'abord.** Sur chaque écran et chaque ligne de liste, le statut du CRA (pastille colorée + libellé + icône) est l'information la plus visible.
2. **Vue rapide.** Un bandeau de KPI en haut des vues clés : jours saisis / jours validés, montant du mois, statut, prochaine échéance.
3. **Friction minimale côté client.** Le client arrive par un lien d'alerte mail → tombe directement sur l'écran de validation, valide en 1 clic. Aucune configuration.
4. **Saisie sans rupture.** Le prestataire saisit au fil du mois ; chaque modification est auto-enregistrée (brouillon), jamais « perdue ».
5. **Irréversibilité claire.** Avant toute action verrouillante (soumettre, valider), confirmation explicite ; après, l'état verrouillé est visuellement sans ambiguïté.

## Navigation & App-shell

**Sidebar persistante** (desktop ≥ 1024px ; repliable en menu hamburger en dessous), fond `--color-sidebar`. Item actif marqué (texte blanc + barre bleue). URL = état (deep-linking) pour partage/retour.

| Rôle | Items de navigation |
|------|---------------------|
| **Prestataire** | Tableau de bord · Projets · CRA · Factures · Règlements |
| **Client** | Tableau de bord · CRA à valider · Historique · (Factures reçues) |
| **Admin** *(v1 minimal)* | configuration de projet, invitations, paramétrage — **aucun déverrouillage d'un CRA validé** (immuable, FR19) |

Topbar : nom du projet/mois en contexte, fil d'ariane si profondeur ≥ 3, avatar + rôle, cloche de notifications (miroir des alertes mail).

---

## Écran 1 — Projets (liste + création)

**Liste.** Tableau : Projet · Client/Prestataire · Période de mission · TJM · Statut mission · CRA du mois (pastille de statut). Tri par colonne ; recherche. Empty state : « Aucun projet pour l'instant — créez votre premier projet » + CTA.

**Création** (panneau latéral ou modale, formulaire progressif) :
- Champs : intitulé, prestataire, client, **dates de mission** (début/fin, date-pickers), **TJM** (input number, suffixe €), périodicité de CRA (mensuel).
- Labels visibles + asterisque requis ; validation au blur ; types d'input sémantiques (number, date) ; helper text sur le TJM (« taux journalier facturé »).
- CTA primaire unique « Créer le projet ».

**Atomic :** atoms (Input, DatePicker, MoneyInput, Button, Badge) · molecules (FormField, ProjectRow, KpiStat) · organisms (ProjectTable, ProjectForm).

## Écran 2 — Saisie du CRA (cœur du produit)

**Layout :** bandeau KPI en haut (Jours travaillés · Demi-journées · Montant du mois = jours × TJM · Statut) + **grille calendrier mensuelle**.

- **Grille calendrier** : une cellule par jour, semaines en lignes. Cellule = état cliquable : Travaillé / Demi-journée / Non travaillé / Congé / **Férié travaillé** (marqué visuellement, ex. liseré). Week-ends et fériés pré-grisés mais forçables (le cas « férié travaillé »).
- Interaction : clic cycle l'état ou ouvre un mini-sélecteur ; cibles ≥ 44px ; sélection multiple possible (peindre plusieurs jours).
- **Auto-save brouillon** à chaque changement (indicateur « Enregistré » discret). `form-autosave`.
- Total recalculé en direct (chiffres tabulaires).
- CTA primaire « Soumettre le CRA » → **dialogue de confirmation** (« Une fois soumis, le client est notifié »). Reste éditable tant que non validé ; si refusé, revient ici avec le message du client affiché en bandeau.

**États :** brouillon (éditable) · soumis (lecture seule en attente) · refusé (éditable + message client visible) · validé (verrouillé, voir écran 4).

**Atomic :** atoms (DayCell, Badge, Tooltip) · molecules (KpiBar, CalendarWeekRow, RejectionNotice) · organisms (CraCalendar, CraSummaryHeader).

## Écran 3 — Validation client

L'écran le plus important pour l'adoption. Le client y arrive depuis l'alerte mail.

- **En-tête contextuel :** prestataire, projet, mois, total jours, montant (le prix que le client doit voir — en direct = même prix que le prestataire).
- **CRA en lecture** : même grille calendrier qu'à l'écran 2, en lecture seule, claire et scannable.
- **Deux actions, hiérarchie nette :**
  - **« Valider »** — CTA primaire bleu. Ouvre un dialogue de confirmation rappelant que la validation **vaut signature électronique** (Option A) et sera horodatée à son nom.
  - **« Demander une correction »** — action secondaire. Ouvre un champ message **obligatoire** (`error-clarity`) ; à l'envoi, le CRA repasse en « refusé » côté prestataire avec ce message.
- Feedback succès après validation (check + transition vers l'état verrouillé).

**Atomic :** molecules (ValidationHeader, ActionBar, FeedbackDialog) · organisms (CraReview, ValidationActions).

## Écran 4 — CRA validé (verrouillé + signature + PDF)

- Bandeau d'état **verrouillé** non ambigu : icône cadenas + « Validé électroniquement par {Client} le {date à la minute} ».
- Grille en lecture seule, visuellement « figée » (teinte/ton différent du brouillon).
- Actions : **Télécharger le PDF** (mention de validation électronique intégrée), **Générer la facture** (→ écran 5).
- Modification **définitivement impossible** (FR19) : un CRA validé est immuable et n'est déverrouillable par personne, pas même l'admin. La seule correction aval porte sur la facture (remplacement tant que le règlement n'est pas confirmé).

**Atomic :** molecules (LockBanner, DownloadButton) · organisms (CraLockedView).

## Écran 5 — Facture + transmission

- Facture pré-remplie depuis le CRA validé : jours validés × TJM, période, parties, numéro de facture, total HT/TTC.
- Vérification/édition légère des mentions, puis **« Transmettre au service administratif »** (CRA validé + facture en un envoi). État de la transmission affiché (transmise le …).
- Empty/disabled : bouton « Générer la facture » désactivé tant que le CRA n'est pas validé (état disabled clair + raison).

**Atomic :** molecules (InvoiceLineItem, AmountSummary, TransmitButton) · organisms (InvoiceForm, InvoiceTransmitPanel).

## Écran 6 — Suivi du règlement

- Vue synthèse par CRA facturé : montant, date de transmission, **date de règlement** (renseignable), statut de paiement.
- Action prestataire : **« Confirmer la réception du règlement »** → passe au statut « Réglé/Reçu » (teal), horodaté.
- Tableau de bord prestataire : pastilles de statut + total en attente de règlement (la « vue rapide » trésorerie).

**Atomic :** molecules (PaymentRow, ConfirmReceiptButton, KpiStat) · organisms (PaymentTable, CashflowSummary).

---

## Mapping atomic design (synthèse)

- **Atoms :** Button, Input, MoneyInput, DatePicker, Badge (statut), Icon (Lucide), Tooltip, Checkbox, DayCell.
- **Molecules :** FormField, KpiStat, StatusPill, ProjectRow / PaymentRow, CalendarWeekRow, ActionBar, ConfirmDialog, RejectionNotice, LockBanner.
- **Organisms :** AppSidebar, Topbar, ProjectTable, ProjectForm, CraCalendar, CraSummaryHeader, CraReview, ValidationActions, InvoiceForm, PaymentTable.
- **Templates :** DashboardLayout (sidebar + topbar + slot), FormPanelLayout, ReviewLayout.
- **Pages :** Projets, SaisieCRA, ValidationCRA, CRAVerrouillé, Facture, Règlements, TableauDeBord (prestataire / client).

## Checklist avant implémentation (taste-skill)

- [ ] Statut visible (pastille + libellé + icône) sur chaque ligne et chaque écran — jamais couleur seule.
- [ ] Chiffres (jours, TJM, montants) en `tabular-nums`.
- [ ] Auto-save brouillon + indicateur sur la saisie CRA.
- [ ] Confirmations avant soumettre / valider ; message obligatoire pour « demander une correction ».
- [ ] État verrouillé sans ambiguïté après validation + horodatage nominatif.
- [ ] Contraste AA, focus visible, ordre clavier, cibles ≥ 44px (calendrier).
- [ ] Responsive 375/768/1024/1440 ; sidebar repliable ; tables → cartes/scroll sur mobile.
- [ ] `prefers-reduced-motion` respecté ; transitions 150–250ms.

## Hors périmètre v1 (rappel, à ne pas designer maintenant)

Rôle intermédiaire + confidentialité des marges · module contrat collaboratif (sections, export Word/PDF, signature contrat) · synthèses/dashboards pluriannuels avancés.
